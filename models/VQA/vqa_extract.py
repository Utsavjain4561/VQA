import os
from keras.models import load_model
from keras.models import model_from_json
# json_file = open('VQA_MODEL.json','r')
# loaded_json_model = json_file.read()
# json_file.close()
# loaded_model = model_from_json(loaded_json_model)

model =load_model('VQA_MODEL_WEIGHTS.hdf5')
model.summary()