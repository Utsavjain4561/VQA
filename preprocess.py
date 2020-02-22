import json
import os
# imdir='%s/COCO_%s_%012d.jpg'

train_annotations = json.load(open('C:/VQA/data/train_annotations.json','r'))
train_questions = json.load(open('C:/VQA/data/train_questions.json','r'))
val_questions = json.load(open('C:/VQA/data/val_questions.json','r'))
val_annotations = json.load(open('C:/VQA/data/val_annotations.json','r'))
test_questions = json.load(open('C:/VQA/data/test_questions.json','r'))

def load_json(annotations,questions,name):
    data=[]
    for i in range(len(questions['questions'])):
        ans=None
        if(name!='test'):
            ans = annotations['annotations'][i]['multiple_choice_answer']
            question_id = annotations['annotations'][i]['question_id']
            image_path = name+'_img'+str(annotations['annotations'][i]['image_id'])
        else:
            question_id = questions['questions'][i]['question_id']
            image_path = name+'_img'+str(questions['questions'][i]['image_id'])
        
        question = questions['questions'][i]['question']
        #  mc_ans = questions['questions'][i]['multiple_choices']
        if (ans!=None):
            data.append({
            'ques_id': question_id,
            'img_path': image_path,
            'question': question,
            #  'MC_ans': mc_ans,
            'ans': ans
        })
        else:
            data.append({
            'ques_id': question_id,
            'img_path': image_path,
            'question': question,
            #  'MC_ans': mc_ans,
            
        })
    json.dump(data, open('C:/VQA/data/vqa_'+name+'.json', 'w'))

load_json(annotations=train_annotations,questions=train_questions,name='train')
load_json(annotations=val_annotations,questions=val_questions,name='val')
load_json(annotations=None,questions=test_questions,name='test')

