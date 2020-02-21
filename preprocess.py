import json
import os
# imdir='%s/COCO_%s_%012d.jpg'
train =[]
train_annotations = json.load(open('annotations/train_annotations.json','r'))
train_questions = json.load(open('annotations/train_questions.json','r'))

for i in range(len(train_annotations['annotations'])):
     ans = train_annotations['annotations'][i]['multiple_choice_answer']
     question_id = train_annotations['annotations'][i]['question_id']
     image_path = 'train_img'+str(train_annotations['annotations'][i]['image_id'])
     question = train_questions['questions'][i]['question']
    #  mc_ans = train_questions['questions'][i]['multiple_choices']
     train.append({
         'ques_id': question_id,
         'img_path': image_path,
         'question': question,
        #  'MC_ans': mc_ans,
         'ans': ans
     })
json.dump(train, open('vqa_train.json', 'w'))
