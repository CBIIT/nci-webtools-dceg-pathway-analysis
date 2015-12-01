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
  CONFIG = 'pathway.config'
  DEBUG = 'pathway.debug'
  OUT_FOLDER = 'pathway.folder.out'
  PATHWAY_FOLDER = 'pathway.folder.pathway'
  POPULATION_FOLDER = 'pathway.folder.population'
  PORT = 'pathway.port'
  UPLOAD_FOLDER = 'pathway.folder.upload'
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
    try:
      ts = str(time.time())

      parameters = dict(request.form)
      for field in parameters:
        parameters[field] = parameters[field][0]
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
          if studyFile.filename.split('.')[-1] in app.config["ALLOWED_TYPES"]:
            filename = os.path.join(os.getcwd(),app.config['UPLOAD_FOLDER'],ts + '-' + str(i) + '.study')
            studyObj['filename'] = filename
            studyFile.save(filename)
          else:
            return Pathway.buildFailure("The file '" + studyFile.filename + "' is not the correct type. Expecting '.study' file.")
        else:
          return Pathway.buildFailure("The file seems to be missing from Study #" + i + ".")
        studyList.append(studyObj)
      del parameters['num_studies']
      parameters['studies'] = studyList

      if parameters['pathway_type'] == 'file_pathway':
        pathFile = filelist['file_pathway']
        if pathFile.filename:
          if pathFile.filename.split('.')[-1] in app.config["ALLOWED_TYPES"]:
            filename = os.path.join(app.config['UPLOAD_FOLDER'],ts + '.pathway')
            parameters['pathway'] = filename
            pathFile.save(filename)
          else:
            return Pathway.buildFailure("The file '" + pathFile.filename + "' is not the correct type. Expecting '.pathway' file.")
        else:
          return Pathway.buildFailure("The pathway file seems to be missing.")
      elif parameters['pathway_type'] == 'database_pathway':
        parameters['pathway'] = os.path.join(app.config['PATHWAY_FOLDER'],parameters['database_pathway'])
      else:
        return Pathway.buildFailure("The pathway file seems to be missing.")
      del parameters['database_pathway']

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
        parameters['plink'] = app.config[Pathway.CONFIG]['pathway.plink.pattern'].replace("$pop",population)
      parameters['population'] = []
      for population in subpop:
        parameters['population'].append(population)
      parameters['outdir'] = app.config[Pathway.CONFIG][Pathway.OUT_FOLDER]
      parameters['refinep'] = parameters.get('refinep',False)
      parameters['gene_subset'] = parameters.get('gene_subset',False)

      pathwayConfig = app.config[Pathway.CONFIG]
      client = Stomp(pathwayConfig[Pathway.QUEUE_CONFIG])
      client.connect()
      client.send(pathwayConfig.getAsString(Pathway.QUEUE_NAME), json.dumps(parameters))
      client.disconnect()
      return Pathway.buildSuccess("The request has been received. An email will be sent when the calculation has completed.")
    except Exception as e:
      exc_type, exc_obj, exc_tb = sys.exc_info()
      fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
      print("EXCEPTION------------------------------", exc_type, fname, exc_tb.tb_lineno)
      return jsonify(data="",message=e, success=False)

  def __init__(self):
    pathwayConfig = PropertyUtil(r"config.ini")
    pathwayConfig[Pathway.QUEUE_CONFIG] = StompConfig(pathwayConfig.getAsString(Pathway.QUEUE_URL))
    app.config[Pathway.CONFIG] = pathwayConfig
    app.config['COMMON_PATH'] = '../common/'
    app.config['PATHWAY_FOLDER'] = pathwayConfig.getAsString(Pathway.PATHWAY_FOLDER)
    app.config['POPULATION_FOLDER'] = pathwayConfig.getAsString(Pathway.POPULATION_FOLDER)
    app.config['UPLOAD_FOLDER'] = pathwayConfig.getAsString(Pathway.UPLOAD_FOLDER)
    app.config["ALLOWED_TYPES"] = ['study','pathway','txt','gz']
    if not os.path.exists(pathwayConfig.getAsString(Pathway.OUT_FOLDER)):
      os.makedirs(pathwayConfig.getAsString(Pathway.OUT_FOLDER))
    app.run(host='0.0.0.0', port=pathwayConfig.getAsInt(Pathway.PORT), debug=pathwayConfig.getAsBoolean(Pathway.DEBUG))

if __name__ == '__main__':
  Pathway()
