library(rjson)
library(ARTP3)

runARTP3 <- function(parameters) {
  ## comments from Han: shall we assign a unique ID for each job?
  id.str <- "PID"
  
  parameters <- fromJSON(parameters)
  out.dir <- parameters$outdir
  setwd(out.dir)
  studies <- parameters$studies
  # Turn Studies into ARTP3 Readable Form
  summary.files <- c()
  lambda <- c()
  sample.size <- list()
  for (study in studies) {
    summary.files <- c(summary.files,study$filename)
    lambda <- c(lambda,as.numeric(study$lambda))
    sample.size[[length(sample.size)+1]] <- as.numeric(study$sample_sizes)
  }
  # Derive Pathway File
  pathway = parameters$pathway
  
  if(max(pathway$Chr) > 22){
    chr.id <- 1:22
  }else{
    chr.id <- sort(unique(pathway$Chr))
  }
  # Derive population reference
  fam <- vector("character", 22)
  bim <- vector("character", 22)
  bed <- vector("character", 22)
  for(i in 1:22){
    fam[i] <- gsub("\\$ext","fam",gsub("\\$vector",i,parameters$plink))
    bim[i] <- gsub("\\$ext","bim",gsub("\\$vector",i,parameters$plink))
    bed[i] <- gsub("\\$ext","bed",gsub("\\$vector",i,parameters$plink))
  }
  reference <- data.frame(fam, bim, bed, stringsAsFactors = FALSE)
  
  ## comments from Han: I want to have an example of the names of the plink files, so that I can make sure the modification I made here is fine
  ## comments from Han: Here I try to get the minimum set of plink files that is required for analyzing the pathway. In brief, if the pathway contains at least one SNP from chromosome i, then the i-th plink file (of chromosome i) is needed in calling the R functions
  reference <- reference[chr.id, , drop = FALSE]
  
  # Set Options
  options <- list(out.dir = out.dir,
                  id.str = id.str,
                  nperm = as.numeric(parameters$nperm),
                  snp.miss.rate = as.numeric(parameters$miss_rate),
                  maf = as.numeric(parameters$maf),
                  HWE.p = as.numeric(parameters$hwep),
                  chr.R2 = as.numeric(parameters$chr),
                  gene.R2 = as.numeric(parameters$gene),
                  rm.gene.subset = parameters$gene_subset,
                  selected.subs = parameters$population,
                  inspect.snp.n = as.numeric(parameters$snp_n),
                  inspect.snp.percent = as.numeric(parameters$snp_percent),
                  inspect.gene.n = as.numeric(parameters$gene_n),
                  inspect.gene.percent = as.numeric(parameters$gene_percent), 
                  only.setup = TRUE, 
                  save.setup = FALSE)
  # Run the analysis
  ## comments from Han: can the current python code catch the exception threw by stop(), which will be invoked by pathway.summaryData and pathway.warm.start?
  setup <- pathway.summaryData(summary.files, pathway, reference, lambda, sample.size, options = options)
  ret1 <- pathway.warm.start(setup)
  
  ret1$setup <- NULL
  returnValue <- ret1
  save(returnValue,file=file.path(out.dir,"1.Rdata"))
  
  ## comments from Han: If nperm is not too large, and the current p-value is inaccurate, and the estimated time for refining p-value is no more than 72 hours, then we can try to refine the p-value
  ## comments from Han: Does this online tool allows a job to be running up to 72 hours??
  if (parameters$refinep && ret1$options$nperm <= 1e7 && !ret1$accurate && ret1$test.timing/3600 * 10 < 72) {
    ## comments from Han: again, do we need a proper way to catch the possible exception threw by pathway.warm.start
    ret2 <- pathway.warm.start(setup, nperm = ret1$options$nperm * 10)
    ret2$setup <- NULL
    
    ## comments from Han: We can overwrite 1.Rdata with ret2 (rename it as returnValue if necessary)
    ## comments from Han: We only need to give 1.Rdata with refined p-value to the users
    ## comments from Han: My suggestion is, no matter parameters$refinep is TRUE or not, returnValue will be saved to the same file 1.Rdata
    
    refinedValue <- ret2
    save(refinedValue,file=file.path(out.dir,"2.Rdata"))
    returnValue <- c(ret1$pathway.pvalue,ret2$pathway.pvalue)
    ## comments from Han: I didn't modify the three lines above directly, since I have no idea how toJSON will process the output when parameters$refinep == TRUE
    ## comments from Han: I suggest to modify those three lines as 
    # returnValue <- ret2
    # save(returnValue,file=file.path(out.dir,"1.Rdata"))
    # returnValue <- c(ret2$pathway.pvalue)
    
  } else {
    returnValue <- c(ret1$pathway.pvalue)
  }
  return(toJSON(returnValue))
}
