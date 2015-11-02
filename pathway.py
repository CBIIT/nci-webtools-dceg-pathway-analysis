import json
import os
import sys
import time
from flask import Flask, Response, request,jsonify, send_from_directory

app = Flask(__name__, static_folder='static', static_url_path="")

class Pathway:

    @app.route('/')
    def root():
        return app.send_static_file('index.html')

    @app.route('/common/<path:filename>')
    def custom_static(filename):
        return send_from_directory(app.config['COMMON_PATH'], filename)

    @app.route('/options/pathway_options', methods=['GET'])
    @app.route('/options/pathway_options/', methods=['GET'])
    def pathway_options():
        try:
            options = []
            i = 1
            for pathways_file in os.listdir(app.config['PATHWAYS_DIR']):
                ind = str(i)
                if pathways_file.endswith(".txt") or pathways_file.endswith(".pathway"):
                    options.append({
                            'code':"PW_"+ind,
                            'text': "Pathway "+ind,
                            'file': pathways_file})
                    i += 1
            return Response(json.dumps(options), status=200, mimetype='application/json')
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print( "EXCEPTION------------------------------", exc_type, fname, exc_tb.tb_lineno)
            return jsonify(error=e, success=False)

    @app.route('/calculate', methods=['POST'])
    @app.route('/calculate/', methods=['POST'])
    def calculate():
        try:
            ts = str(time.time())

            parameters = request.form
            filelist = request.files
            studyObj = {};

            num_studies = int(parameters['num_studies'])

            i = 0
            failed = None
            while (i != num_studies):
                i = i + 1

                studyKey = "study_" + str(i)

                studyObj['studies'] = []
                studyObj['studies'].append(parameters['lambda_' + str(i)])

                for resourceInd in range(1,int(request.form['num_resource_' + str(i)])):
                    studyObj['studies'].append(parameters['sample_size_' + str(resourceInd)])

                studyFile = filelist[studyKey]

                if not testFileExtension(studyFile, app.config["ALLLOWED_TYPES"][0]):
                    failed = jsonify(
                        message="The file '" + studyFile.filename+"' is not the correct type. Expecting '.study' file", success=False)
                    break

                if studyFile.filename:
                    filename = ts + '-' + str(i) + '.study'
                    studyObj['studies'].append(filename)
                    studyFile.save(
                        os.path.join(
                            app.config['UPLOAD_FOLDER'], filename ))
            if failed is not None:
                failed.mimetype='application/json'
                failed.status_code=400
                return failed

            if parameters['pathway_type'] == 'file_pathway':
                pathFile = filelist['file_pathway']
                if not testFileExtension(pathFile, app.config["ALLLOWED_TYPES"][1]):
                    failed = jsonify(
                        message="The file '"+pathFile.filename+"' is not the correct type. Expecting '.pathway' file",
                        success=False)
                    failed.mimetype='application/json'
                    failed.status_code=400
                    return failed

                if pathFile.filename:
                    parameters['database_pathway'] = None
                    filename = ts + '.pathway'
                    parameters['file_pathway'] = filename
                    pathFile.save(os.path.join(app.config['UPLOAD_FOLDER'],
                              filename))
            return jsonify(data="", message="The request has been received. An email will be sent when the calculation has completed.", success=True),200
        except Exception as e:
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print("EXCEPTION------------------------------", exc_type, fname, exc_tb.tb_lineno)
            return jsonify(data="",message=e, success=False)

    def doNothing(self, *args):
        return

    def enableDebug(self, *args):
        self.DEBUG = True

    def setPort(self, webPort):
        self.WEB_PORT = webPort

    def __init__(self):
        argFunctions = {'-p': self.setPort, '--debug': self.enableDebug}
        self.DEBUG = False
        self.WEB_PORT = 8180
        lastValue = None
        for value in sys.argv:
            argFunctions.get(lastValue, self.doNothing)(value)
            lastValue = value
        argFunctions.get(lastValue, self.doNothing)(None)
        app.config['PATHWAYS_DIR'] = 'paths'
        app.config['COMMON_PATH'] = '../common/'
        app.config['UPLOAD_FOLDER'] = 'uploads'
        app.config["ALLLOWED_TYPES"] = ['study', 'pathway','txt']
        app.run(host='0.0.0.0', port=self.WEB_PORT, debug=self.DEBUG)

def testFileExtension(fileItem, ext):
    splitName = fileItem.filename.split('.')
    # get last index of array and test
    if splitName[-1] != ext:
        return False
    return True

if __name__ == '__main__':
    Pathway()
