import json
import os
import rpy2.robjects as robjects
import smtplib

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
  MAIL_SENDER = 'mail.sender'

  def composeMail(self,recipients,message):
    if not isinstance(recipients,list):
      recipients = [recipients]
    message = "From: Pathway Analysis Tool\r\nTo: " + ", ".join(recipients) + "\r\nSubject: Pathway Analysis Results\r\n\r\n"+message
    config = self.CONFIG
    smtp = smtplib.SMTP(config.getAsString(RequestProcessor.MAIL_HOST))
    smtp.sendmail(config.getAsString(RequestProcessor.MAIL_SENDER),recipients,message)

  def consume(self, client, frame):
    parameters = frame.body
    # Run R-Script
    artp3Result = self.r_runARTP3(parameters)[0]
    # email results
    message = "Result: " + artp3Result
    parameters = json.loads(parameters)
    self.composeMail(parameters['email'],message)
    # remove the already used files
    for study in parameters['studies']:
      os.remove(study['filename'])
    if (parameters['pathway_type'] == 'file_pathway'):
      os.remove(parameters['file_pathway'])

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

