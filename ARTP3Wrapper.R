library(rjson)
library(ARTP3)

runARTP3 <- function(parameters) {
  id.str <- toString(trunc(as.numeric(Sys.time()),0));
  
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
  pathway <- data.frame(read.table(parameters$pathway, header=TRUE), stringAsFactors = FALSE)
  rm.gene <- apply(table(pathway$Gene, pathway$Chr)!=0, 1, sum)
  rm.gene <- names(which(rm.gene > 1))
  pathway <- pathway[!(pathway$Gene %in% rm.gene), ]

  chr.id <- sort(unique(pathway$Chr))
  chr.id <- chr.id[chr.id <= 22]
  # Derive population reference
  fam <- vector("character", length(chr.id))
  bim <- vector("character", length(chr.id))
  bed <- vector("character", length(chr.id))
  counter <- 0
  for(i in chr.id){
    counter <- counter+1
    fam[counter] <- gsub("\\$ext","fam",gsub("\\$vector",i,parameters$plink))
    bim[counter] <- gsub("\\$ext","bim",gsub("\\$vector",i,parameters$plink))
    bed[counter] <- gsub("\\$ext","bed",gsub("\\$vector",i,parameters$plink))
  }
  reference <- data.frame(fam, bim, bed, stringsAsFactors = FALSE)
  
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
  setup <- pathway.summaryData(summary.files, pathway, reference, lambda, sample.size, options = options)
  ret1 <- pathway.warm.start(setup)
  
  ret1$setup <- NULL
  pvalue <- ret1$pathway.pvalue
  saveValue <- ret1
  
  if (parameters$refinep && ret1$options$nperm <= 1e7 && !ret1$accurate && ret1$test.timing/3600 * 10 < 72) {
    ret2 <- pathway.warm.start(setup, nperm = ret1$options$nperm * 10)
    ret2$setup <- NULL
    
    saveValue <- ret2
    pvalue <- ret2$pathway.pvalue
  }
  save(saveValue,file=file.path(out.dir,"1.Rdata"))
  return(pvalue)
}

runARTP3WithHandlers <- function(parameters) {
  suppressWarnings(suppressMessages({
    returnValue <- list()
    returnValue$pvalue <- tryCatch(
      withCallingHandlers(
        runARTP3(parameters),
        message=function(m) {
          returnValue$messages <<- append(returnValue$messages, m$message)
        },
        warning=function(w) {
          returnValue$warnings <<- append(returnValue$warnings, w$message)
        }
      ),
      error=function(e) {
        returnValue$error <<- e$message
        return(NULL)
      }
    )
  }))
  return(toJSON(returnValue))
}
