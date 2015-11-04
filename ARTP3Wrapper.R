library(RJSONIO)
library(ARTP3)

runARTP3 <- function(parameters) {
  id.str <- "ABC"
  save.setup <- FALSE
  parameters <- fromJSON(parameters)
  
  previousDirectory <- getwd()
  setwd(parameters$population)
  
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
  pathway = switch(parameters$pathway_type,
    file_pathway = parameters$file_pathway,
    database_pathway = c(),
    c())
  # Derive population reference
  fam <- vector("character", 22)
  bim <- vector("character", 22)
  bed <- vector("character", 22)
  for(i in 1:22){
    fam[i] <- paste("1000genomes.chr", i, ".fam", sep = "")
    bim[i] <- paste("1000genomes.chr", i, ".bim", sep = "")
    bed[i] <- paste("1000genomes.chr", i, ".bed", sep = "")
  }
  reference <- data.frame(fam, bim, bed)
  # Set Options
  options <- list(id.str = id.str,
                  nperm = as.numeric(parameters$nperm),
                  snp.miss.rate = as.numeric(parameters$miss_rate),
                  maf = as.numeric(parameters$maf),
                  HWE.p = as.numeric(parameters$hwep),
                  chr.R2 = as.numeric(parameters$chr),
                  gene.R2 = as.numeric(parameters$gene),
                  rm.gene.subset = parameters$gene_subset,
                  save.setup = save.setup,
                  inspect.snp.n = as.numeric(parameters$snp_n),
                  inspect.snp.percent = as.numeric(parameters$snp_percent),
                  inspect.gene.n = as.numeric(parameters$gene_n),
                  inspect.gene.percent = as.numeric(parameters$gene_percent))
  # Uhh...
  refinePValue <- parameters$refinep
  # print parameters
  #print("Study File:")
  #print(summary.files)
  #print(paste("Pathway File:",pathway))
  #print("Reference:")
  #print(reference)
  #print("Lambda:")
  #print(lambda)
  #print("Sample Size:")
  #print(sample.size)
  #print("Options:")
  #print(options)
  #print(paste("refine.p:",refinePValue))
  # Run the analysis
  returnValue <- toJSON(pathway.summaryData(summary.files, pathway, reference, lambda, sample.size, options = options))
  setwd(previousDirectory)
  return(returnValue)
}

