library(rjson)
library(ARTP3)

runARTP3 <- function(parameters) {
  id.str <- "PID"
  save.setup <- FALSE
  parameters <- fromJSON(parameters)
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
  # Derive population reference
  fam <- vector("character", 22)
  bim <- vector("character", 22)
  bed <- vector("character", 22)
  for(i in 1:22){
    fam[i] <- gsub("\\$ext","fam",gsub("\\$vector",i,parameters$plink))
    bim[i] <- gsub("\\$ext","bim",gsub("\\$vector",i,parameters$plink))
    bed[i] <- gsub("\\$ext","bed",gsub("\\$vector",i,parameters$plink))
  }
  reference <- data.frame(fam, bim, bed)
  # Set Options
  out.dir = parameters$outdir
  options <- list(out.dir = out.dir,
                  id.str = id.str,
                  nperm = as.numeric(parameters$nperm),
                  snp.miss.rate = as.numeric(parameters$miss_rate),
                  maf = as.numeric(parameters$maf),
                  HWE.p = as.numeric(parameters$hwep),
                  chr.R2 = as.numeric(parameters$chr),
                  gene.R2 = as.numeric(parameters$gene),
                  rm.gene.subset = parameters$gene_subset,
                  save.setup = save.setup,
                  selected.subs = parameters$population,
                  inspect.snp.n = as.numeric(parameters$snp_n),
                  inspect.snp.percent = as.numeric(parameters$snp_percent),
                  inspect.gene.n = as.numeric(parameters$gene_n),
                  inspect.gene.percent = as.numeric(parameters$gene_percent))
  # Run the analysis
  returnValue <- pathway.summaryData(summary.files, pathway, reference, lambda, sample.size, options = options)
  save(returnValue,file=file.path(out.dir,"1.Rdata"))
  returnValue <- returnValue$pathway.pvalue
  if (parameters$refinep) {
    options <- list(out.dir = out.dir,
                    id.str = id.str,
                    nperm = as.numeric(parameters$nperm)*10,
                    snp.miss.rate = as.numeric(parameters$miss_rate),
                    maf = as.numeric(parameters$maf),
                    HWE.p = as.numeric(parameters$hwep),
                    chr.R2 = as.numeric(parameters$chr),
                    gene.R2 = as.numeric(parameters$gene),
                    rm.gene.subset = options$rm.gene.subset,
                    save.setup = save.setup,
                    selected.subs = parameters$population,
                    inspect.snp.n = as.numeric(parameters$snp_n),
                    inspect.snp.percent = as.numeric(parameters$snp_percent),
                    inspect.gene.n = as.numeric(parameters$gene_n),
                    inspect.gene.percent = as.numeric(parameters$gene_percent))
    refinedValue <- pathway.summaryData(summary.files, pathway, reference, lambda, sample.size, options = options)
    save(refinedValue,file=file.path(out.dir,"2.Rdata"))
    returnValue <- c(returnValue,refinedValue$pathway.pvalue)
  } else {
    returnValue <- c(returnValue)
  }
  return(toJSON(returnValue))
}
