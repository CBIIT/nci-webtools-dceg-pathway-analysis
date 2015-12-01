import json
import os
import rpy2.robjects as robjects
import smtplib

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
    smtp.sendmail(config.getAsString(RequestProcessor.MAIL_ADMIN),recipients,packet.as_string())

  def consume(self, client, frame):
    parameters = frame.body
    try:
      # Run R-Script
      artp3Result = self.r_runARTP3(parameters)[0]
    except Exception as e:
      self.composeMail(self.CONFIG.getAsString(RequestProcessor.MAIL_ADMIN),str(e)+"\n\n"+parameters)
      #self.composeMail(json.loads(parameters)['email'],"Unfortunately there was an error processing your request. The site administrators have been alerted to the problem.")
      return
    # email results
    parameters = json.loads(parameters)
    files = [ os.path.join(parameters['outdir'],'1.Rdata') ]
    if (parameters['refinep']):
        files.append(os.path.join(parameters['outdir'],'2.Rdata'))
        artp3Result = json.loads(artp3Result)
        message = "Unrefined Result: " + str(artp3Result[0]) + "\nRefined Result: " + str(artp3Result[1])
    else:
        message = "Result: " + artp3Result
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
    robjects.r('''source('ARTP3Wrapper.R')''')
    self.r_runARTP3 = robjects.r['runARTP3']

if __name__ == '__main__':
  RequestProcessor().run()
  reactor.run()
