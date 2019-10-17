import json
import math
import os
import rpy2.robjects as robjects
import smtplib
import time
import logging

from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from PropertyUtil import PropertyUtil
from stompest.async import Stomp
from stompest.async.listener import SubscriptionListener
from stompest.config import StompConfig
from stompest.protocol import StompSpec
from twisted.internet import reactor, defer

class pathwayProcessor(SubscriptionListener):
  CONFIG = 'queue.config'
  NAME = 'queue.name'
  URL = 'queue.url'
  UPLOAD_FOLDER = 'pathway.folder.upload'
  MAIL_HOST = 'mail.host'
  MAIL_ADMIN = 'mail.admin'

  def composeMail(self,recipients,message,files=[]):
    if not isinstance(recipients,list):
      recipients = [recipients]
    packet = MIMEMultipart()
    packet['Subject'] = "Subject: Pathway Analysis Results"
    packet['From'] = "Pathway Analysis Tool <do.not.reply@nih.gov>"
    packet['To'] = ", ".join(recipients)
    packet.attach(MIMEText(message))
    for file in files:
      with open(file,"rb") as openfile:
        packet.attach(MIMEApplication(
          openfile.read(),
          Content_Disposition='attachment; filename="%s"' % os.path.basename(file),
          Name=os.path.basename(file)
        ))
    config = self.CONFIG
    smtp = smtplib.SMTP(config.getAsString(pathwayProcessor.MAIL_HOST))
    smtp.sendmail("do.not.reply@nih.gov",recipients,packet.as_string())

  def rLength(self, tested):
    if tested is None:
      return 0
    if isinstance(tested,list) or isinstance(tested,set):
      return len(tested)
    else:
      return 1

  def consume(self, client, frame):
    starttime = str(time.time())
    parameters = json.loads(frame.body)
    timestamp = frame.headers['timestamp']
    outfileString = os.path.join(parameters['outdir'],str(parameters['idstr'])+'.json')
    jsonout = {'submittedTime': parameters['idstr'], 'queuedTime':timestamp,'payload':parameters,'processStartTime': starttime}
    with open(outfileString,'w') as outfile:
      json.dump(jsonout,outfile)
    try:
      # Run R-Script
      artpResult = json.loads(self.r_runARTP(json.dumps(parameters))[0])
    except Exception as e:
      artpResult = {}
      artpResult["error"] = str(e)
    jsonout["processStopTime"] = str(time.time())
    message = ""
    if "warnings" in artpResult:
      jsonout["warnings"] = artpResult["warnings"]
      with open(outfileString,'w') as outfile:
        json.dump(jsonout,outfile)
      message += "\nWarnings:\n"
      if (isinstance(artpResult["warnings"],list)):
        for warning in artpResult["warnings"]:
          message += warning.strip() + "\n\n"
      else:
        message += artpResult["warnings"].strip() + "\n\n"
    if "error" in artpResult:
      jsonout["error"] = artpResult["error"]
      jsonout["status"] = "error"
      with open(outfileString,'w') as outfile:
        json.dump(jsonout,outfile)
      message = "Error: " + artpResult["error"].strip() + "\n" + message + "\n\n" +frame.body
      print(message)
      self.composeMail(self.CONFIG.getAsString(pathwayProcessor.MAIL_ADMIN).split(","),message)
      self.composeMail(parameters["email"],"Unfortunately there was an error processing your request. The site administrators have been alerted to the problem. Please contact " + self.CONFIG.getAsString(pathwayProcessor.MAIL_ADMIN) + " if any question.\n\n" + message)
      return
    # email results
    files = [ os.path.join(parameters['outdir'],parameters['idstr']+'.Rdata') ]
    saveValue = artpResult["saveValue"]
    jsonout["saveValue"] = saveValue
    jsonout["status"] = "success"
    with open(outfileString,'w') as outfile:
      json.dump(jsonout,outfile)
    message = ("Dear User,\n\n" +
              "We have analyzed your data using the ARTP2 package (version: " + ".".join([str(x) for x in saveValue['options']['version'][0]]) + "). " +
              "The sARTP test returned a pathway p-value " + str(round(saveValue['pathway.pvalue'],1-int(math.floor(math.log10(saveValue['pathway.pvalue']))))) + ". The p-value was estimated by " + str(saveValue['options']['nperm']) + " resampling steps.\n\n" +
              "Several gene/SNP filters were applied to the data based on specified options. " +
              "There are " + str(self.rLength(saveValue['deleted.genes'].get('Gene',None))) + " genes and " + str(self.rLength(set(saveValue['deleted.snps'].get('SNP',None)))) + " SNPs that were excluded from the analysis. " +
              "After that, " + str(self.rLength(saveValue['gene.pvalue']['Chr'])) + " unique genes and " + str(self.rLength(set(saveValue['pathway']['SNP']))) + " unique SNPs were used in testing. " +
              "Some warning messages (if any) can be found at the end of this email.\n\n" +
              "More detailed result of this pathway analysis is saved as an R list, saveValue, in the attached file. You can read it in R through function load(). For example, the pathway p-value is\n\n" +
              "saveValue$pathway.pvalue\n\n" +
              "and the gene-level p-values are saved in a data frame\n\n" +
              "saveValue$gene.pvalue\n\n" +
              "To understand the reason for each SNP/gene excluded from the analysis, check\n\n" +
              "saveValue$deleted.snps\n\n" +
              "and\n\n" +
              "saveValue$deleted.genes\n\n" +
              "A full list of genes and SNPs that were used in testing is saved in a data frame\n\n" +
              "saveValue$pathway\n\n" +
              "All the options are saved in \n\n" +
              "saveValue$options\n\n" +
              "For more information, please refer to the help document of function sARTP in R package ARTP2.\n\n" +
              message)
    print(message)
    self.composeMail(parameters['email'],message,files)
    # remove the already used files
    for study in parameters['studies']:
      os.remove(study['filename'])
    if (parameters['pathway_type'] == 'file_pathway'):
      os.remove(parameters['file_pathway'])
    for file in files:
      os.remove(file)

  @defer.inlineCallbacks
  def run(self):
    client = yield Stomp(self.CONFIG[pathwayProcessor.CONFIG]).connect()
    headers = {
      # client-individual mode is necessary for concurrent processing (requires ActiveMQ >= 5.2)
      StompSpec.ACK_HEADER: StompSpec.ACK_CLIENT_INDIVIDUAL,
      # the maximal number of messages the broker will let you work on at the same time
      'activemq.prefetchSize': '100',
    }
    client.subscribe(self.CONFIG[pathwayProcessor.NAME], headers, listener=self)
    client.add(listener=self)

  def onConnectionLost(self,connection,reason):
    super(pathwayProcessor,self).onConnectionLost(connection,reason)
    self.run()

  def __init__(self):
    super(pathwayProcessor,self).__init__(self.consume)
    config = PropertyUtil(r"config.ini")
    config[pathwayProcessor.CONFIG] = StompConfig(uri="failover:("+config.getAsString(pathwayProcessor.URL)+")?startupMaxReconnectAttempts=-1,initialReconnectDelay=300000")
    self.CONFIG = config
    robjects.r('''source('ARTPWrapper.R')''')

    self.r_runARTP = robjects.r['runARTPWithHandlers']


def main():
  logging.basicConfig(level=logging.INFO)
  pathwayProcessor().run()
  reactor.run()


if __name__ == '__main__':
  main()
