var terms = {
    "study":{
        term:"",
        define:"Upload one or more study files containing the summary results of SNPs. The file must contain the following columns: 'SNP', 'RefAllele', 'EffectAllele', 'BETA', and at least one of 'SE', 'P'."
    },
    "file_pathway":{
        term:"",
        define:"Select from existing pathways or upload a file containing the definition of a pathway"
    },
    "population":{
        term:"",
        define:"Select a population from the list."
    },
    "nperm": {
        term:"Number of Permutations",
        define:"The number of permutations. The default is 1E5."
    },
    "lambda": {
        term:"Lambda",
        define: "Lambda to be adjusted in pathway analysis. The default is 1.0."
    },
    "miss_rate": {
        term:"SNP Miss Rate",
        define:"any SNP with missing rate greater than snp.miss.rate will be removed from the analysis. The default is 0.05."
    },
    "maf": {
        term:"maf",
        define:"any SNP with minor allele frequency less than maf will be removed from the analysis. The default is 0.05."
    },
    "hwep": {
        term:"HWE.p",
        define:"any SNP with HWE exact p-value less than HWE.p will be removed from the analysis. The test is applied to the reference data. The default is 1E-5."
    },
    "gene": {
        term:"Gene.R2",
        define:"a number between 0 and 1 to filter out SNPs that are highly correlated within each gene. The cor function will be called to compute the R^2 values between each pair of SNPs and remove one SNP with lower MAF in each pair with R^2 greater than gene.R2. The default is 0.95."
    },
    "chr": {
        term:"Chr.R2",
        define:"a number between 0 and 1 to filter out SNPs that are highly correlated within each chromosome. The cor function will be called to compute the R^2 values between each pair of SNPs and remove one SNP with lower MAF in each pair with R^2 greater than chr.R2. The default is 0.95."
    },
    "gene_subset": {
        term:"rm.gene.subset",
        define:"TRUE to remove genes which are subsets of other genes. The default is TRUE."
    },
    "snp_n": {
        term: "inspect.snp.n",
        define: "The number of candidate truncation points to inspect the top SNPs in a gene. The default is 5."
    },
    "snp_percent": {
        term: "inspect.snp.percent",
        define: "A value x between 0 and 1 such that a truncation point will be defined at every x percent of the top SNPs. The default is 0 so that the truncation points will be 1:inspect.snp.n."
    },
    "gene_n": {
        term: "inspect.gene.n",
        define: "The number of candidate truncation points to inspect the top genes in the pathway. The default is 10."
    },
    "gene_percent": {
        term: "inspect.gene.percent",
        define: "a value x between 0 and 1 such that a truncation point will be defined at every x percent of the top genes. If 0 then the truncation points will be 1:inspect.gene.n. The default is 0.05."
    }
};
function activateTooltips(e){
        var tipText = terms[this.name].define;
        var tipTitle = terms[this.name].term;

        $(this).attr("title", tipText);

        $(this).tooltip({
            content: "<b>" + tipTitle + "</b><p>" + tipText + "</p>",
            position: { my: "left+5% center" },
            items: ".tooltip[title]"
        });

        $(this).tooltip('open');
}

$(function() {
    $(".tooltip").tooltip();

    $(".tooltip").on("hover", activateTooltips).on("click", activateTooltips);

    $(".tooltip").on("blur", function(){
        $(this).tooltip("close");
    });
});
