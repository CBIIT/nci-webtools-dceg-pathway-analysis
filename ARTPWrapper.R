library(rjson)
library(ARTP2)

runARTP <- function(parameters) {
  parameters <- fromJSON(parameters)
  id.str <- parameters$idstr
  out.dir <- parameters$outdir
  studies <- parameters$studies
  # Turn Studies into ARTP Readable Form
  summary.files <- c()
  lambda <- c()
  sample.size <- list()
  for (study in studies) {
    summary.files <- c(summary.files,study$filename)
    lambda <- c(lambda,as.numeric(study$lambda))
    sample.size[[length(sample.size)+1]] <- as.integer(study$sample_sizes)
  }
  # Derive Pathway File
  pathway <- read.table(parameters$pathway, header=TRUE, as.is = TRUE)
  rm.gene <- apply(table(pathway$Gene, pathway$Chr)!=0, 1, sum)
  rm.gene <- names(which(rm.gene > 1))
  pathway <- pathway[!(pathway$Gene %in% rm.gene), ]
  
  ## comments from Han: min(pathway$Chr) > 22 has a special meaning
  ## comments from Han: in that case, the numbers in the column $Chr are not a real chromosome numbers
  ## comments from Han: instead, the users may re-define the grouping, and the SNPs in that pathway can distribute at all 22 chromosomes
  ## comments from Han: I have changed 'max' to 'min' in this version
  if(min(pathway$Chr) > 22){
    chr.id <- 1:22
  }else{
    chr.id <- sort(unique(pathway$Chr))
  }
  
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
                  nperm = as.integer(parameters$nperm),
                  snp.miss.rate = as.numeric(parameters$miss_rate),
                  maf = as.numeric(parameters$maf),
                  HWE.p = as.numeric(parameters$hwep),
                  chr.R2 = as.numeric(parameters$chr),
                  gene.R2 = as.numeric(parameters$gene),
                  rm.gene.subset = parameters$gene_subset,
                  selected.subs = as.character(parameters$population),
                  inspect.snp.n = as.integer(parameters$snp_n),
                  inspect.snp.percent = as.numeric(parameters$snp_percent),
                  inspect.gene.n = as.integer(parameters$gene_n),
                  inspect.gene.percent = as.numeric(parameters$gene_percent), 
                  only.setup = TRUE, 
                  save.setup = FALSE)
  # Run the analysis
  family <- 'gaussian'
  setup <- pathway.summaryData(summary.files, pathway, family, reference, lambda, nsamples=sample.size, options = options)
  ret1 <- pathway.warm.start(setup)
  
  ret1$setup <- setup
  pvalue <- ret1$pathway.pvalue
  saveValue <- ret1
  
  save(saveValue,file=file.path(out.dir,paste(id.str,".Rdata",sep="")))
  ## comments from Han: It would be great if we can check from the outside of runARTP() to see if we have at least one 1.Rdata for this job (a unique job ID is then essential)
  ## comments from Han: If we have a 1.Rdata, then we can send something to the users no matter if there is an error during refining or not.
  ## comments from Han: If we do not have extra hours for this project, we can do that in the future. 
  
  if (as.logical(parameters$refinep) && ret1$options$nperm <= 1e7 && !ret1$accurate && ret1$test.timing/3600 * 10 < 72) {
    ret2 <- pathway.warm.start(setup, nperm = ret1$options$nperm * 10)
    ret2$setup <- NULL
    
    saveValue <- ret2
    pvalue <- ret2$pathway.pvalue
  }
  save(saveValue,file=file.path(out.dir,paste(id.str,".Rdata",sep="")))
  return(pvalue)
}

runARTPFromConsole <- function(file) {
  print(runARTP(toJSON(fromJSON(file=file))))
}

runARTPWithHandlers <- function(parameters) {
  suppressWarnings(suppressMessages({
    returnValue <- list()
    returnValue$pvalue <- tryCatch(
      withCallingHandlers(
        runARTP(parameters),
        message=function(m) {
          print(m$message)
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
