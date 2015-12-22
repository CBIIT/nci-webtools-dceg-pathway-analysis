import json
import os
import sys
import time
import pprint
from flask import Flask, Response, request, jsonify, send_from_directory
from PropertyUtil import PropertyUtil
from stompest.config import StompConfig
from stompest.sync import Stomp

app = Flask(__name__, static_folder="", static_url_path="")

class Pathway:
  FOLDERROOT = 'pathway.folder.root'	
  CONFIG = 'pathway.config'
  DEBUG = 'pathway.debug'
  OUT_FOLDER = 'pathway.folder.out'
  PATHWAY_FOLDER = 'pathway.folder.pathway'
  POPULATION_FOLDER = 'pathway.folder.population'
  PORT = 'pathway.port'
  UPLOAD_FOLDER = 'pathway.folder.upload'
  PLINK_PATTERN = 'pathway.plink.pattern'
  QUEUE_CONFIG = 'queue.config'
  QUEUE_NAME = 'queue.name'
  QUEUE_URL = 'queue.url'

  @staticmethod
  def buildFailure(message):
    response = jsonify(message=message, success=False)
    response.mimetype = 'application/json'
    response.status_code = 400
    return response

  @staticmethod
  def buildSuccess(message):
    response = jsonify(message=message, success=True)
    response.mimetype = 'application/json'
    response.status_code = 200
    return response

  @app.route('/calculate', methods=['POST'])
  @app.route('/calculate/', methods=['POST'])
  def calculate():
    pathwayConfig = app.config[Pathway.CONFIG]
    try:
      ts = str(time.time())

      parameters = dict(request.form)
      for field in parameters:
        parameters[field] = parameters[field][0]
      parameters['idstr'] = ts
      filelist = request.files
      studyList = []

      num_studies = int(parameters['num_studies'])

      for i in xrange(1,num_studies+1):
        studyKey = "study_" + str(i)
        studyObj = {}

        studyObj['lambda'] = parameters['lambda_' + str(i)]
        del parameters['lambda_'+str(i)]

        studyObj['sample_sizes'] = []
        for resourceInd in range(1,int(parameters['num_resource_' + str(i)])+1):
          studyObj['sample_sizes'].append(parameters['sample_size_' + str(i) + '_' + str(resourceInd)])
          del parameters['sample_size_' + str(i) + '_' + str(resourceInd)]
        del parameters['num_resource_' + str(i)]

        studyFile = filelist[studyKey]
        if studyFile.filename:
          filename = os.path.join(os.getcwd(),app.config['UPLOAD_FOLDER'],ts + '-' + str(i) + '.study')
          studyObj['filename'] = filename
          studyFile.save(filename)
        else:
          return Pathway.buildFailure("The file seems to be missing from Study #" + i + ".")
        studyList.append(studyObj)
      del parameters['num_studies']
      parameters['studies'] = studyList

      if parameters['pathway_type'] == 'file_pathway':
        pathFile = filelist['file_pathway']
        if pathFile.filename:
          filename = os.path.join(app.config['UPLOAD_FOLDER'],ts + '.pathway')
          parameters['pathway'] = filename
          pathFile.save(filename)
        else:
          return Pathway.buildFailure("The pathway file seems to be missing.")
      elif parameters['pathway_type'] == 'database_pathway':
        parameters['pathway'] = os.path.join(app.config['PATHWAY_FOLDER'],parameters['database_pathway'])
      else:
        return Pathway.buildFailure("The pathway file seems to be missing.")
      if "database_pathway" in parameters:
        del parameters['database_pathway']

      if "selectAll" in parameters:
        del parameters['selectAll']
      if "selectItem" in parameters:
        del parameters['selectItem']
      superpop = {}
      subpop = {}
      for population in parameters['populations'].split(","):
        population = population.split('|')
        if os.path.isfile(os.path.join(app.config['POPULATION_FOLDER'],population[0],population[1]+'.txt')):
          superpop[population[0]] = 1
          subpop_file = os.path.join(app.config['POPULATION_FOLDER'],population[0],population[1]+'.txt')
          with open(subpop_file, 'r') as subpop_file:
            for line in subpop_file:
              subpop[line.strip()] = 1
        else:
          return Pathway.buildFailure("An invalid population was submitted.")
      if (len(superpop) > 1):
        return Pathway.buildFailure("An invalid population was submitted.")
      del parameters['populations']
      for population in superpop:
        parameters['plink'] = app.config['PLINK_PATTERN'].replace("$pop",population)
      parameters['population'] = []
      for population in subpop:
        parameters['population'].append(population)
      parameters['outdir'] = app.config['OUT_FOLDER']
      parameters['refinep'] = parameters.get('refinep',"").lower() in ['true','t','1']
      parameters['gene_subset'] = parameters.get('gene_subset',"").lower() in ['true','t','1']
      
      jsonout = {"submittedTime": parameters['idstr'], "payload": parameters}
      with open(os.path.join(app.config['OUT_FOLDER'],str(parameters['idstr'])+'.json'),'w') as outfile:
        json.dump(jsonout,outfile)
      
      client = Stomp(pathwayConfig[Pathway.QUEUE_CONFIG])
      client.connect()
      client.send(pathwayConfig.getAsString(Pathway.QUEUE_NAME), json.dumps(parameters))
      client.disconnect()
      return Pathway.buildSuccess("The request has been received. An email will be sent when the calculation has completed.")
    except Exception as e:
      exc_type, exc_obj, exc_tb = sys.exc_info()
      fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
      print("EXCEPTION------------------------------", exc_type, fname, exc_tb.tb_lineno)
      return Pathway.buildFailure(str(e))

  def __init__(self):
    pathwayConfig = PropertyUtil(r"config.ini")
    pathwayConfig[Pathway.QUEUE_CONFIG] = StompConfig(pathwayConfig.getAsString(Pathway.QUEUE_URL))
    app.config[Pathway.CONFIG] = pathwayConfig
    app.config['PATHWAY_FOLDER'] = os.path.join(pathwayConfig.getAsString(Pathway.FOLDERROOT),pathwayConfig.getAsString(Pathway.PATHWAY_FOLDER))
    app.config['POPULATION_FOLDER'] = os.path.join(pathwayConfig.getAsString(Pathway.FOLDERROOT), pathwayConfig.getAsString(Pathway.POPULATION_FOLDER))
    app.config['UPLOAD_FOLDER'] = os.path.join(pathwayConfig.getAsString(Pathway.FOLDERROOT), pathwayConfig.getAsString(Pathway.UPLOAD_FOLDER))
    app.config['OUT_FOLDER'] = os.path.join(pathwayConfig.getAsString(Pathway.FOLDERROOT),pathwayConfig.getAsString(Pathway.OUT_FOLDER))
    app.config['PLINK_PATTERN'] = os.path.join(pathwayConfig.getAsString(Pathway.FOLDERROOT),pathwayConfig.getAsString(Pathway.PLINK_PATTERN))
    if not os.path.exists(app.config['OUT_FOLDER']):
      os.makedirs(app.config['OUT_FOLDER'])
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
      os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(host='0.0.0.0', port=pathwayConfig.getAsInt(Pathway.PORT), debug=pathwayConfig.getAsBoolean(Pathway.DEBUG))

if __name__ == '__main__':
  Pathway()
