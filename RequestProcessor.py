import json
import os
import rpy2.robjects as robjects
import smtplib
import time

from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from PropertyUtil import PropertyUtil
from stompest.async import Stomp
from stompest.async.listener import SubscriptionListener
from stompest.config import StompConfig
from stompest.protocol import StompSpec
from twisted.internet import reactor, defer

class RequestProcessor:
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
    smtp = smtplib.SMTP(config.getAsString(RequestProcessor.MAIL_HOST))
    smtp.sendmail("do.not.reply@nih.gov",recipients,packet.as_string())

  def consume(self, client, frame):
    starttime = str(time.time())
    parameters = json.loads(frame.body)
    timestamp = frame.headers['timestamp']
    parameters['idstr'] = timestamp
    jsonout = {'queuedTime':timestamp,'payload':parameters,'processStartTime': starttime}
    with open(os.path.join(parameters['outdir'],str(timestamp)+'.json'),'w') as outfile:
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
      with open(os.path.join(parameters['outdir'],str(timestamp)+'.json'),'w') as outfile:
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
      with open(os.path.join(parameters['outdir'],str(timestamp)+'.json'),'w') as outfile:
        json.dump(jsonout,outfile)
      message = "Error: " + artpResult["error"].strip() + "\n" + message + "\n\n" +frame.body
      self.composeMail(self.CONFIG.getAsString(RequestProcessor.MAIL_ADMIN).split(","),message)
      self.composeMail(parameters["email"],"Unfortunately there was an error processing your request. The site administrators have been alerted to the problem. Please contact " + self.CONFIG.getAsString(RequestProcessor.MAIL_ADMIN) + " if any question.\n\n" + message)
      return
    # email results
    files = [ os.path.join(parameters['outdir'],str(timestamp)+'.Rdata') ]
    jsonout["pvalue"] = str(artpResult["pvalue"])
    jsonout["status"] = "success"
    with open(os.path.join(parameters['outdir'],str(timestamp)+'.json'),'w') as outfile:
      json.dump(jsonout,outfile)
    message = "P-Value: " + str(artpResult["pvalue"]) + "\n" + message
    print message
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
    client = yield Stomp(self.CONFIG[RequestProcessor.CONFIG]).connect()
    headers = {
      # client-individual mode is necessary for concurrent processing (requires ActiveMQ >= 5.2)
      StompSpec.ACK_HEADER: StompSpec.ACK_CLIENT_INDIVIDUAL,
      # the maximal number of messages the broker will let you work on at the same time
      'activemq.prefetchSize': '100',
    }
    client.subscribe(self.CONFIG[RequestProcessor.NAME], headers, listener=SubscriptionListener(self.consume))

  def __init__(self):
    config = PropertyUtil(r"config.ini")
    config[RequestProcessor.CONFIG] = StompConfig(config.getAsString(RequestProcessor.URL))
    self.CONFIG = config
    robjects.r('''source('ARTPWrapper.R')''')
    self.r_runARTP = robjects.r['runARTPWithHandlers']

if __name__ == '__main__':
  RequestProcessor().run()
  reactor.run()
