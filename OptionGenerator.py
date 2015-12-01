import json
import os

from PropertyUtil import PropertyUtil

class OptionGenerator:
  PATHWAY_FOLDER = 'pathway.folder.pathway'
  POPULATION_FOLDER = 'pathway.folder.population'

  def pathway_options(self):
    options = []
    for pathways_file in os.listdir(self.config[OptionGenerator.PATHWAY_FOLDER]):
      if pathways_file.endswith(".txt") or pathways_file.endswith(".pathway") or pathways_file.endswith(".txt.xls.gz"):
        pathways_filename = pathways_file.split(".")[0]
        options.append({
                         'code': pathways_file,
                         'text': pathways_filename
                       })
    return options

  def population_options(self):
    options = []
    for super_population in [name for name in os.listdir(self.config[OptionGenerator.POPULATION_FOLDER])
      if os.path.isdir(os.path.join(self.config[OptionGenerator.POPULATION_FOLDER], name))]:
        subpopulation_path = os.path.join(self.config[OptionGenerator.POPULATION_FOLDER], super_population)
        for subpopulation in [sub_name for sub_name in os.listdir(subpopulation_path) if os.path.isdir(subpopulation_path)]:
          population_code = subpopulation.split(".")[0]
          options.append({
                           'group': super_population,
                           'subPopulation': population_code,
                           'text': population_code
                         })
    return options

  def __init__(self):
    self.config = PropertyUtil(r"config.ini")
    with open("pathway_options.json","w") as file:
      file.write(json.dumps(self.pathway_options()))
    with open("population_options.json","w") as file:
      file.write(json.dumps(self.population_options()))

if __name__ == '__main__':
  OptionGenerator()
