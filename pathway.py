import json
import os
import sys
import time
from flask import Flask, Response, request, jsonify, send_from_directory
from PropertyUtil import PropertyUtil
from stompest.config import StompConfig
from stompest.sync import Stomp

app = Flask(__name__, static_folder='static', static_url_path="")

class Pathway:
    CONFIG = 'pathway.config'
    DEBUG = 'pathway.debug'
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

    @staticmethod
    def testFileExtension(fileItem,ext):
        return fileItem.filename.split('.')[-1] == ext

    @app.route('/')
    def root():
        return app.send_static_file('index.html')

    @app.route('/common/<path:filename>')
    def custom_static(filename):
        return send_from_directory(app.config['COMMON_PATH'], filename)

    @app.route('/pathwayRest/options/pathway_options', methods=['GET'])
    @app.route('/pathwayRest/options/pathway_options/', methods=['GET'])
    def pathway_options():
        try:
            options = []
            i = 1
            for pathways_file in os.listdir(app.config['PATHWAY_FOLDER']):
                ind = str(i)
                if pathways_file.endswith(".txt") or pathways_file.endswith(".pathway"):
                    options.append({
                            'code': "PW_"+ind,
                            'text': "Pathway " + ind,
                            'file': pathways_file})
                    i += 1
            return Response(json.dumps(options), status=200, mimetype='application/json')
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print( "EXCEPTION------------------------------", exc_type, fname, exc_tb.tb_lineno)
            return jsonify(error=e, success=False)

    @app.route('/pathwayRest/options/population_options', methods=['GET'])
    @app.route('/pathwayRest/options/population_options/', methods=['GET'])
    def population_options():
        try:
            #static json of the population groups
            return Response(json.dumps({'AFR':{'fullName':'African','subPopulations':{'YRI':'Yoruba in Ibadan, Nigera','LWK':'Luhya in Webuye, Kenya','GWD':'Gambian in Western Gambia','MSL':'Mende in Sierra Leone','ESN':'Esan in Nigera','ASW':'Americans of African Ancestry in SW USA','ACB':'African Carribbeans in Barbados'}},'AMR':{'fullName':'Ad Mixed American','subPopulations':{'MXL':'Mexican Ancestry from Los Angeles, USA','PUR':'Puerto Ricans from Puerto Rico','CLM':'Colombians from Medellin, Colombia','PEL':'Peruvians from Lima, Peru'}},'EAS':{'fullName':'East Asian','subPopulations':{'CHB':'Han Chinese in Bejing, China','JPT':'Japanese in Tokyo, Japan','CHS':'Southern Han Chinese','CDX':'Chinese Dai in Xishuangbanna, China','KHV':'Kinh in Ho Chi Minh City, Vietnam'}},'EUR':{'fullName':'European','subPopulations':{'CEU':'Utah Residents from North and West Europe','TSI':'Toscani in Italia','FIN':'Finnish in Finland','GBR':'British in England and Scotland','IBS':'Iberian population in Spain'}},'SAS':{'fullName':'South Asian','subPopulations':{'GIH':'Gujarati Indian from Houston, Texas','PJL':'Punjabi from Lahore, Pakistan','BEB':'Bengali from Bangladesh','STU':'Sri Lankan Tamil from the UK','ITU':'Indian Telugu from the UK'}}}), status=200, mimetype='application/json');

            options = []
            for population_subfolder in [name for name in os.listdir(app.config['POPULATION_FOLDER'])
                if os.path.isdir(os.path.join(app.config['POPULATION_FOLDER'], name))]:
                    population_name_file = os.path.join(app.config['POPULATION_FOLDER'], population_subfolder, "population.name.txt")
                    subpopulation_path = os.path.join(app.config['POPULATION_FOLDER'], population_subfolder)
                    for population_groups_folder in [name for name in os.listdir(subpopulation_path)]:
                        if os.path.isfile(population_name_file):
                            with open(population_name_file,'r') as f:
                                population_name = f.read().strip()
                                population_code = population_name[0:3].strip().upper()
                                population_text = "(" + population_code + ") " + population_name
                            options.append({
                                            'group': population_subfolder,
                                            'code': population_code,
                                            'text': population_text
                                      })
            return Response(json.dumps(options), status=200, mimetype='application/json')
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print( "EXCEPTION------------------------------", exc_type, fname, exc_tb.tb_lineno)
            return jsonify(error=e, success=False)


    @app.route('/calculate', methods=['POST'])
    @app.route('/calculate/', methods=['POST'])

    @app.route('/pathwayRest/calculate', methods=['POST'])
    @app.route('/pathwayRest/calculate/', methods=['POST'])
    def calculate():
        try:
            ts = str(time.time())

            parameters = dict(request.form)
            for field in parameters:
                parameters[field] = parameters[field][0]
            filelist = request.files
            studyList = [];

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
                    if Pathway.testFileExtension(studyFile, app.config["ALLLOWED_TYPES"][0]):
                        filename = os.path.join(os.getcwd(),app.config['UPLOAD_FOLDER'],ts + '-' + str(i) + '.study')
                        studyObj['filename'] = filename
                        studyFile.save(filename)
                    else:
                        return Pathway.buildFailure("The file '" + studyFile.filename + "' is not the correct type. Expecting '.study' file.")
                else:
                    return Pathway.buildFailure("The file seems to be missing from Study #" + i + ".")
                studyList.append(studyObj);
            del parameters['num_studies']
            parameters['studies'] = studyList

            if parameters['pathway_type'] == 'file_pathway':
                pathFile = filelist['file_pathway']
                if pathFile.filename:
                    if Pathway.testFileExtension(pathFile, app.config["ALLLOWED_TYPES"][1]):
                        del parameters['database_pathway']
                        filename = os.path.join(os.getcwd(),app.config['UPLOAD_FOLDER'],ts + '.pathway')
                        parameters['file_pathway'] = filename
                        pathFile.save(filename)
                    else:
                        return Pathway.buildFailure("The file '" + pathFile.filename + "' is not the correct type. Expecting '.pathway' file.")
                else:
                    return Pathway.buildFailure("The pathway file seems to be missing.")
            else:
                del parameters['database_pathway']


            print(parameters['selectItempopulation'])
            print("----------------------------------------------------------------------")
            if parameters['selectItempopulation'] in [name for name in os.listdir(app.config['POPULATION_FOLDER']) if os.path.isdir(os.path.join(app.config['POPULATION_FOLDER'],name))]:
                parameters['populations'] = os.path.join(os.getcwd(),app.config['POPULATION_FOLDER'],parameters['populations'])
            else:
                return Pathway.buildFailure("An invalid population was submitted.")

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
        app.config['POPULATION_FOLDER'] = pathwayConfig.getAsString(Pathway.POPULATION_FOLDER)
        app.config['PATHWAY_FOLDER'] = pathwayConfig.getAsString(Pathway.PATHWAY_FOLDER)
        app.config['UPLOAD_FOLDER'] = pathwayConfig.getAsString(Pathway.UPLOAD_FOLDER)
        app.config["ALLLOWED_TYPES"] = ['study', 'pathway','txt']
        app.run(host='0.0.0.0', port=pathwayConfig.getAsInt(Pathway.PORT), debug=pathwayConfig.getAsBoolean(Pathway.DEBUG))

if __name__ == '__main__':
    Pathway()
