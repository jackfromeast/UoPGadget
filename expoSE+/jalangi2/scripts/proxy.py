import codecs
import hashlib
import os
import sys
import inspect
import traceback
import sj

from mitmproxy import ctx
from mitmproxy.script import concurrent

from subprocess import CalledProcessError, Popen, PIPE, STDOUT

JALANGI_HOME = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(inspect.getframeinfo(inspect.currentframe()).filename
)), os.pardir))
WORKING_DIR = os.getcwd()

sys.path.insert(0, JALANGI_HOME+'/scripts')

def start():
    print('Jalangi home is ' + JALANGI_HOME)
    print('Current working directory is ' + WORKING_DIR)

def load(l):
    l.add_option('args', str, "", "Jalangi2 Arguments")
    l.add_option('cache', bool, True, "Jalangi2 use cache")

def processFile (flow, content, ext):

    try:

        url = flow.request.scheme + '://' + flow.request.host + ':' + str(flow.request.port) + flow.request.path
        name = os.path.splitext(flow.request.path_components[-1])[0] if hasattr(flow.request,'path_components') and len(flow.request.path_components) else 'index'

        hash = hashlib.md5(content.encode('utf-8')).hexdigest()
        baseName = 'cache/' + flow.request.host + '/' + hash + '/' + hashlib.md5(name.encode('utf-8')).hexdigest()
        fileName = baseName + '.' + ext
        instrumentedFileName = baseName + '_jalangi_.' + ext
        
        if not os.path.exists('cache/' + flow.request.host + '/' + hash):
            os.makedirs('cache/' + flow.request.host + '/' + hash)
        
        if not ctx.options.cache or not os.path.isfile(instrumentedFileName):
            print('Instrumenting: ' + fileName + ' from ' + url)
            with open(fileName, 'w') as file:
                file.write(content)
            sub_env = { 'JALANGI_URL': url }
            sj.execute(sj.INSTRUMENTATION_SCRIPT + ' ' + ctx.options.args + ' ' + fileName + ' --out ' + instrumentedFileName + ' --outDir ' + os.path.dirname(instrumentedFileName), None, sub_env)
        else:
            print('Already instrumented: ' + fileName + ' from ' + url)
        
        with open (instrumentedFileName, "r") as file:
            data = file.read()
        
        return data

    except:
        print('Exception in processFile() @ proxy.py')
        exc_type, exc_value, exc_traceback = sys.exc_info()
        lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
        print(''.join(lines))
        return content

@concurrent
def response(flow):

    # Do not invoke jalangi if the requested URL contains the query parameter noInstr
    # (e.g. https://cdn.com/jalangi/jalangi.min.js?noInstr=true)
    if flow.request.query and flow.request.query.get('noInstr', None):
        return

    try:
        flow.response.decode()

        content_type = None
        csp_key = None
        for key in flow.response.headers.keys():
            if key.lower() == "content-type":
                content_type = flow.response.headers[key].lower()
            elif key.lower() == "content-security-policy":
                csp_key = key

        if content_type:
            if content_type.find('javascript') >= 0:
                flow.response.text = processFile(flow, flow.response.text, 'js')
            if content_type.find('html') >= 0:
                flow.response.text = processFile(flow, flow.response.text, 'html')

        # Disable the content security policy since it may prevent jalangi from executing
        if csp_key:
            flow.response.headers.pop(csp_key, None)
    except:
        print('Exception in response() @ proxy.py')
        exc_type, exc_value, exc_traceback = sys.exc_info()
        lines = traceback.format_exception(exc_type, exc_value, exc_traceback)
        print(''.join(lines))
