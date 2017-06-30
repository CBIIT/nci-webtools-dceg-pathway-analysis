
## file.path is a character
## it is the path of a data file uploaded to the server for format check
## I will need time to implement this function
## but the currently version shown below is good enough for testing purpose
FormatCheckWrapper <- function(file.path){

  ## I will check the format here
  ## ...
  ## ...
  ## If something is wrong, I will throw an error message through stop()
  ## uncomment the next line to simulate the situation when format check does not pass
  # stop('format of uploaded file does not meet requirement')

  ## if format check passed, return the number of studies in this file
  ## this part is ready to use, only minor change could be possibble in the future
  st <- read.table(file.path, header = TRUE, as.is = TRUE, nrows = 1e4)
  header <- toupper(colnames(st))
  id <- ifelse('DIRECTION' %in% header, which(header == 'DIRECTION'), 0)
  nstudy <- 5 #hard-coded
  if(id){
    col.class <- rep('NULL', length(header))
    names(col.class) <- colnames(st)
    col.class[colnames(st)[id]] <- 'character'
    dir <- read.table(file.path, header = TRUE, as.is = TRUE, colClasses = col.class, nrow = 1)[,1]
    dir <- strsplit(dir, split = '')
    nstudy <- sapply(dir, length)
  }

  nstudy

}
