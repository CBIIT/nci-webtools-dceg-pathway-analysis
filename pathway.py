
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
        print 'reached calculate'
        #        response = None
        ts = str(time.time())
        print "request.form: " + request.form

        #        parameters = request.form.to_dict()

        filelist = request.files.getlist('study')

        if len(request.files.getlist('study')) > 1:
            parameters['studies'] = []
            filecount = 1
            for file in filelist:
                if file.filename:
                    filename = ts + '-' + str(filecount) + '.study'
                    filecount += 1
                    parameters['studies'].append(filename)
                    file.save(os.path.join(app.config['UPLOAD_FOLDER'],
                              filename))
        if parameters['pathway_type'] == 'file_pathway':
            file = request.files['file_pathway']
            if file.filename:
                del parameters['database_pathway']
                filename = ts + '.pathway'
                parameters['file_pathway'] = filename
                file.save(os.path.join(app.config['UPLOAD_FOLDER'],
                          filename))
        return Response(json.dumps(parameters), mimetype='application/json')

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
        app.config['UPLOAD_FOLDER'] = 'uploads'
        app.run(host='0.0.0.0', port=self.WEB_PORT, debug=self.DEBUG)


if __name__ == '__main__':
    Pathway()
