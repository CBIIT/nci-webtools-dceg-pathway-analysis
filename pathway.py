import json
import os
import sys
import time
import pprint
from flask import Flask, Response, request, jsonify, send_from_directory
from PropertyUtil import PropertyUtil
from OptionGenerator import OptionGenerator
import pathwayProcessor
from stompest.config import StompConfig
from stompest.sync import Stomp
import threading

app = Flask(__name__)

#Flask parameter names
CONFIG = 'pathway.config'
QUEUE_CONFIG = 'queue.config'
#config.ini parameter names
FOLDERROOT = 'pathway.folder.root'
OUT_FOLDER = 'pathway.folder.out'
PATHWAY_FOLDER = 'pathway.folder.pathway'
POPULATION_FOLDER = 'pathway.folder.population'
UPLOAD_FOLDER = 'pathway.folder.upload'
PLINK_PATTERN = 'pathway.plink.pattern'
QUEUE_NAME = 'queue.name'
QUEUE_URL = 'queue.url'

def buildFailure(message):
  response = jsonify(message=message, success=False)
  response.mimetype = 'application/json'
  response.status_code = 400
  return response

def buildSuccess(message):
  response = jsonify(message=message, success=True)
  response.mimetype = 'application/json'
  response.status_code = 200
  return response

@app.route('/calculate', methods=['POST'])
@app.route('/calculate/', methods=['POST'])
def calculate():
  pathwayConfig = app.config[CONFIG]
  try:
    ts = str(time.time())

    parameters = dict(request.form)
    print("parameters", parameters)
    # for field in parameters:
    #   parameters[field] = parameters[field].encode('utf-8')
    parameters['idstr'] = ts
    filelist = request.files
    studyList = []

    num_studies = int(parameters['num_studies'])

    for i in range(1,num_studies+1):
      studyKey = "study_" + str(i)
      studyObj = {}

      studyObj['lambda'] = parameters['lambda_' + str(i)].encode('utf-8')
      del parameters['lambda_'+str(i)]

      studyObj['sample_sizes'] = []
      for resourceInd in range(1,int(parameters['num_resource_' + str(i)])+1):
        studyObj['sample_sizes'].append(parameters['sample_size_' + str(i) + '_' + str(resourceInd)].encode('utf-8'))
        del parameters['sample_size_' + str(i) + '_' + str(resourceInd)]
      del parameters['num_resource_' + str(i)]

      studyFile = filelist[studyKey]
      if studyFile.filename:
        filename = os.path.join(os.getcwd(),app.config['UPLOAD_FOLDER'],ts + '-' + str(i) + '.study')
        studyObj['filename'] = filename.encode('utf-8')
        studyFile.save(filename)
      else:
        return buildFailure("The file seems to be missing from Study #" + i + ".")
      studyList.append(studyObj)
    del parameters['num_studies']
    parameters['studies'] = studyList

    print("parameters['pathway_type']", parameters['pathway_type'])
    if parameters['pathway_type'] == 'file_pathway':
      pathFile = filelist['file_pathway']
      print("pathFile", pathFile)
      print("pathFile.filename", pathFile.filename)
      if pathFile.filename:
        filename = os.path.join(app.config['UPLOAD_FOLDER'],ts + '.pathway')
        parameters['pathway'] = filename
        pathFile.save(filename)
      else:
        return buildFailure("The pathway file seems to be missing.")
    elif parameters['pathway_type'] == 'database_pathway':
      parameters['pathway'] = os.path.join(app.config['PATHWAY_FOLDER'],parameters['database_pathway'])
    else:
      return buildFailure("The pathway file seems to be missing.")
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
        return buildFailure("An invalid population was submitted.")
    if (len(superpop) > 1):
      return buildFailure("An invalid population was submitted.")
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
    
    client = Stomp(pathwayConfig[QUEUE_CONFIG])
    client.connect()
    print("pathwayConfig", pathwayConfig)
    print("pathwayConfig.getAsString(QUEUE_NAME)", pathwayConfig.getAsString(QUEUE_NAME))



    parameters['snp_percent'] = parameters['snp_percent'].encode('utf-8')
    parameters['plink'] = parameters['plink'].encode('utf-8')
    parameters['gene_percent'] = parameters['gene_percent'].encode('utf-8')
    parameters['selectAllpopulation'] = parameters['selectAllpopulation'].encode('utf-8')
    parameters['snp_n'] = parameters['snp_n'].encode('utf-8')
    parameters['gene_n'] = parameters['gene_n'].encode('utf-8')
    parameters['pathway_type'] = parameters['pathway_type'].encode('utf-8')
    parameters['maf'] = parameters['maf'].encode('utf-8')
    parameters['miss_rate'] = parameters['miss_rate'].encode('utf-8')
    parameters['selectItempopulation'] = parameters['selectItempopulation'].encode('utf-8')
    parameters['nperm'] = parameters['nperm'].encode('utf-8')
    parameters['hwep'] = parameters['hwep'].encode('utf-8')
    parameters['file_pathway'] = parameters['file_pathway'].encode('utf-8')
    parameters['pathway'] = parameters['pathway'].encode('utf-8')
    parameters['chr'] = parameters['chr'].encode('utf-8')
    parameters['super_population'] = parameters['super_population'].encode('utf-8')
    parameters['gene'] = parameters['super_population'].encode('utf-8')
    parameters['email'] = parameters['super_population'].encode('utf-8')



    for field in parameters:
      print("parameters[" + field + "]: ", parameters[field])
    client.send(pathwayConfig.getAsString(QUEUE_NAME), json.dumps(parameters))
    client.disconnect()
    return buildSuccess("The request has been received. An email will be sent when the calculation has completed.")
  except Exception as e:
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    print(("EXCEPTION------------------------------", exc_type, fname, exc_tb.tb_lineno))
    return buildFailure(str(e))

def main():
  pathwayConfig = PropertyUtil(r"config.ini")
  pathwayConfig[QUEUE_CONFIG] = StompConfig(pathwayConfig.getAsString(QUEUE_URL))
  app.config[CONFIG] = pathwayConfig
  app.config['PATHWAY_FOLDER'] = os.path.join(pathwayConfig.getAsString(FOLDERROOT),pathwayConfig.getAsString(PATHWAY_FOLDER))
  app.config['POPULATION_FOLDER'] = os.path.join(pathwayConfig.getAsString(FOLDERROOT), pathwayConfig.getAsString(POPULATION_FOLDER))
  app.config['UPLOAD_FOLDER'] = os.path.join(pathwayConfig.getAsString(FOLDERROOT), pathwayConfig.getAsString(UPLOAD_FOLDER))
  app.config['OUT_FOLDER'] = os.path.join(pathwayConfig.getAsString(FOLDERROOT),pathwayConfig.getAsString(OUT_FOLDER))
  app.config['PLINK_PATTERN'] = os.path.join(pathwayConfig.getAsString(FOLDERROOT),pathwayConfig.getAsString(PLINK_PATTERN))
  
  if not os.path.exists(app.config['OUT_FOLDER']):
    os.makedirs(app.config['OUT_FOLDER'])
  if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

  OptionGenerator()

main()


