import json
import os
import sys
import time
from flask import Flask, Response, request,jsonify

app = Flask(__name__, static_folder='static', static_url_path="")

class Pathway:

    @app.route('/')
    def root():
        return app.send_static_file('index.html')

    @app.route('/options/pathway_options', methods=['GET'])
    @app.route('/options/pathway_options/', methods=['GET'])
    def pathway_options():
        return Response('[{"code":"PW1","text":"Pathway 1"},{"code":"PW2","text":"Pathway 2"},{"code":"PW3","text":"Pathway 3"},{"code":"PW4","text":"Pathway 4"}]'
                        , status=200, mimetype='application/json')

    @app.route('/calculate', methods=['POST'])
    @app.route('/calculate/', methods=['POST'])

    def calculate():
        try:
            ts = str(time.time())

            parameters = request.form
            filelist = request.files
            studyObj = {};

            for ind in range(1,int(request.form['num_studies'])):

                studyKey = "study_" + str(ind)
                studyObj['studies'] = []

                studyObj['studies'].append(parameters['lambda_' + str(ind)])

                for resourceInd in range(1,int(request.form['num_resource_' + str(ind)])):
                    studyObj['studies'].append(parameters['sample_size_' + str(resourceInd)])


                studyFile = filelist[studyKey]

                if studyFile.filename:
                    print studyFile.filename
                    filename = ts + '-' + str(ind) + '.study'
                    studyObj['studies'].append(filename)
                    studyFile.save(
                        os.path.join(
                            app.config['UPLOAD_FOLDER'], filename ))

            if parameters['pathway_type'] == 'file_pathway':
                file = request.files['file_pathway']
                if file.filename:
                    del parameters['database_pathway']
                    filename = ts + '.pathway'
                    parameters['file_pathway'] = filename
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'],
                              filename))

            return jsonify(data=parameters,success=True)
        except Exception as e:
            print "EXCEPTION------------------------------"
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            return jsonify(data=e,success=False)

    def doNothing(self, *args):
        return

    def enableDebug(self, *args):
        self.DEBUG = True

    def returnError(self):
        return Response('{"error":"xyz"}')

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
        app.config['ALLOWED_EXTENSIONS'] = ['study']
        app.config['UPLOAD_FOLDER'] = 'uploads'
        app.run(host='0.0.0.0', port=self.WEB_PORT, debug=self.DEBUG)

if __name__ == '__main__':
    Pathway()
