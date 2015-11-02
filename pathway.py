import json
import os
import sys
import time

from flask import Flask, Response, request,jsonify
from PropertyUtil import PropertyUtil
from stompest.config import StompConfig
from stompest.sync import Stomp
from werkzeug.datastructures import MultiDict

app = Flask(__name__, static_folder='static', static_url_path="")

class Pathway:
    CONFIG = 'pathway.config'
    DEBUG = 'pathway.debug'
    PORT = 'pathway.port'
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

    @app.route('/options/pathway_options', methods=['GET'])
    @app.route('/options/pathway_options/', methods=['GET'])
    def pathway_options():
        return Response('[{"code":"PW1","text":"Pathway 1"},{"code":"PW2","text":"Pathway 2"},{"code":"PW3","text":"Pathway 3"},{"code":"PW4","text":"Pathway 4"}]', status=200, mimetype='application/json')

    @app.route('/calculate', methods=['POST'])
    @app.route('/calculate/', methods=['POST'])
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
                studyObj['sample_sizes'] = [];

                for resourceInd in range(1,int(request.form['num_resource_' + str(i)])):
                    studyObj['sample_sizes'].append(parameters['sample_size_' + str(resourceInd)])

                studyFile = filelist[studyKey]
                if studyFile.filename:
                    if Pathway.testFileExtension(studyFile, "study"):                  
                        filename = ts + '-' + str(i) + '.study'
                        studyObj['filename'] = filename
                        studyFile.save( os.path.join( app.config['UPLOAD_FOLDER'], filename ))
                    else:
                        return Pathway.buildFailure("The file '" + studyFile.filename + "' is not the correct type. Expecting '.study' file.")
                else:
                    return Pathway.buildFailure("The file seems to be missing from Study #" + i + ".")
                studyList.append(studyObj);
            parameters['studies'] = studyList;

            if parameters['pathway_type'] == 'file_pathway':
                pathFile = filelist['file_pathway']
                print("FILE: " + pathFile.filename)
                if pathFile.filename:
                    if Pathway.testFileExtension(pathFile, "pathway"):
                        del parameters['database_pathway']
                        filename = ts + '.pathway'
                        parameters['file_pathway'] = filename
                        pathFile.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    else:
                        return Pathway.buildFailure("The file '" + pathFile.filename + "' is not the correct type. Expecting '.pathway' file.")
                else:
                    return Pathway.buildFailure("The pathway file seems to be missing.")

            pathwayConfig = app.config[Pathway.CONFIG]
            client = Stomp(pathwayConfig[Pathway.QUEUE_CONFIG])
            client.connect()
            client.send(pathwayConfig.getAsString(Pathway.QUEUE_NAME), json.dumps(parameters))
            client.disconnect()
            print "Returning...."
            print Pathway.buildSuccess("Your request has been submitted to the queue and an email will be sent to " + parameters['email'] + " when it has completed.")
            return Pathway.buildSuccess("Your request has been submitted to the queue and an email will be sent to " + parameters['email'] + " when it has completed.")
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print( "EXCEPTION------------------------------", exc_type, fname, exc_tb.tb_lineno)
            return jsonify(data=e, success=False)

    def __init__(self):
        pathwayConfig = PropertyUtil(r"config.ini")
        pathwayConfig[Pathway.QUEUE_CONFIG] = StompConfig(pathwayConfig.getAsString(Pathway.QUEUE_URL))
        app.config[Pathway.CONFIG] = pathwayConfig
        app.config['UPLOAD_FOLDER'] = 'uploads'
        app.config["ALLLOWED_TYPES"] = ['study', 'pathway']
        app.run(host='0.0.0.0', port=pathwayConfig.getAsInt(Pathway.PORT), debug=pathwayConfig.getAsBoolean(Pathway.DEBUG))

if __name__ == '__main__':
    Pathway()
