# Purpose

ARTP2 (Adaptive Rank Truncated Product - Version 2) is an R package of biological pathway association analysis or pathway meta-analysis for genome-wide association studies (GWAS).i
It also provides tools for gene-level association test as a special case. ARTP2 is an enhanced version of two previously released packages ARTP and AdaJoint.

# Setup
1. In the top level directory create a directory called app
2. Move all the files from the top level directory into a directory called app
3. Get the build.sh script which generates scripts to setup, start, and stop a wsgi application using mod_wsgi-express
4. In the directory containing the app directory run the following command sh build.sh --name pathway --port 5001 --root `$PWD`

# Start 
4. In the directory containing the app directory execute the following script: ./setup-pathway.sh
5. In the directory containing the app directory execute the following script: ./start-pathway.sh

# Stop

1. In the directory containing the app directory execute the following script: ./stop-pathway.sh
 
