import React, { useCallback, useEffect, useRef, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import ChangingProgressProvider from "./ChangingProgressProvider";
import AnimatedProgressProvider from "./AnimatedProgressProvider";
import { easeQuadInOut } from "d3-ease";
import "react-circular-progressbar/dist/styles.css";
import ProgressBar from "react-bootstrap/ProgressBar";
import { drawShape } from "./draw";
import {
  getInference,
  loadNewModelPromise,
  loadBenchmarkModelPromise,
} from "./model";
import { CANVAS_SIZE, IMAGE_SIZE, COLOR_NAMES, SHAPES } from "./constants";
import { randint } from "./utils";

import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import { min } from "@tensorflow/tfjs";

const SAMPLE_QUESTIONS = [
  "What color is the shape?",
  "Is there a blue shape in the image?",
  "Is there a red shape?",
  "Is there a green shape in the image?",
  "Is there a black shape?",
  "Is there not a teal shape in the image?",
  "Does the image contain a rectangle?",
  "Does the image not contain a circle?",
  "What shape is present?",
  "Is no triangle present?",
  "Is a circle present?",
  "Is a rectangle present?",
  "Is there a triangle?",
  "What is the color of the shape?",
  "What shape does the image contain?",
];

const randomQuestion = () =>
  SAMPLE_QUESTIONS[randint(0, SAMPLE_QUESTIONS.length - 1)];

const urlParams = new URLSearchParams(window.location.search);
const isEmbedded = urlParams.has("embed");

function App() {
  const [benchmarkWidth, setBenchmarkWidth] = useState(0);
  const [display, setDisplay] = useState("block");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [newWidth, setNewWidth] = useState(0);
  const [color, setColor] = useState(null);
  const [shape, setShape] = useState(null);
  const [question, setQuestion] = useState(randomQuestion());
  const [answer, setAnswer] = useState(null);
  const [newModelLoaded, setNewModelLoaded] = useState(false);
  const [benchmarkModelLoaded, setBenchmarkModelLoaded] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const resultCanvas = useRef(null);
  const mainCanvas = useRef(null);
  const smallCanvas = useRef(null);

  const onPredict = useCallback(() => {
    setPredicting(true);
    setDisplay("none");
  }, [setPredicting]);
  useEffect(() => {
    if (predicting) {
      console.log("Scrolling");
      resultCanvas.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [resultCanvas]);
  useEffect(() => {
    if (smallCanvas.current) {
      const ctx = smallCanvas.current.getContext("2d");
      const ratio = IMAGE_SIZE / CANVAS_SIZE;
      ctx.scale(ratio, ratio);
    }
  }, [smallCanvas]);

  useEffect(() => {
    if (predicting) {
      // Draw the main canvas to our smaller, correctly-sized canvas
      const ctx = smallCanvas.current.getContext("2d");
      ctx.drawImage(mainCanvas.current, 0, 0);

      getInference(smallCanvas.current, question).then((answer) => {
        setAnswer(answer);
        console.log("Benchmark Accuarcy", answer[0].benchmarkAccuracy);
        console.log("New Accuarcy", answer[1].newAccuracy);
        answer[0].benchmarkAccuracy = compareWords(
          answer[0].benchmarkAnswer,
          correctAnswer
        );
        answer[1].newAnswerAccuracy = compareWords(
          answer[1].newAnswer,
          correctAnswer
        );
        console.log("Benchmark Accuarcy", answer[0].benchmarkAccuracy);
        console.log("New Accuarcy", answer[1].newAccuracy);
        let benchmarkWidth = `${(answer[0].benchmarkAccuracy * 100).toFixed(
            2
          )}%`,
          newWidth = `${(answer[1].newAccuracy * 100).toFixed(2)}%`;
        setBenchmarkWidth(benchmarkWidth);
        setNewWidth(newWidth);
        setPredicting(false);
      });
    }
  }, [predicting, question]);
  function compareWords(a, b) {
    var equivalency = 0;
    var minLength = a.length > b.length ? b.length : a.length;
    var maxLength = a.length < b.length ? b.length : a.length;
    for (var i = 0; i < minLength; i++) {
      if (a[i] === b[i]) {
        equivalency++;
      }
    }

    var weight = equivalency / maxLength;
    return weight;
  }
  const onQuestionChange = useCallback(
    (e) => {
      setQuestion(e.target.value);
      setAnswer(null);
      setDisplay("block");
    },
    [setQuestion]
  );
  const onCorrectAnswerChange = useCallback(
    (e) => {
      setCorrectAnswer(e.target.value);
      setAnswer(null);
      setDisplay("block");
    },
    [setCorrectAnswer]
  );

  const randomizeImage = useCallback(() => {
    const context = mainCanvas.current.getContext("2d");
    const colorName = COLOR_NAMES[randint(0, COLOR_NAMES.length - 1)];
    const shape = SHAPES[randint(0, SHAPES.length - 1)];

    drawShape(context, shape, colorName);

    setColor(colorName);
    setShape(shape);
    setAnswer(null);
    setDisplay("block");
  }, [mainCanvas]);

  const randomizeQuestion = useCallback(() => {
    let q = question;
    while (q === question) {
      q = randomQuestion();
    }
    setQuestion(q);
    setAnswer(null);
  }, [question, setQuestion]);

  useEffect(() => {
    randomizeImage();
    loadBenchmarkModelPromise.then(() => {
      setBenchmarkModelLoaded(true);
    });
    loadNewModelPromise.then(() => {
      setNewModelLoaded(true);
    });
  }, []);

  return (
    <div className="root">
      {!isEmbedded && (
        <>
          <h1>VQA Demo</h1>
          <h2>
            A Javascript demo of a{" "}
            <a href="https://towardsdatascience.com/deep-learning-and-visual-question-answering-c8c8093941bc">
              Visual Question Answering (VQA)
            </a>{" "}
            model trained on the{" "}
            <a
              href="https://pypi.org/project/easy-vqa/"
              target="_blank"
              rel="nofollow noreferrer"
            >
              easy-VQA dataset
            </a>
            .
          </h2>
          <p className="description">
            See the source code on{" "}
            <a
              href="https://github.com/Utsavjain4561/Visual-Question-Answering"
              target="_blank"
              rel="nofollow noreferrer"
            >
              Github
            </a>
            .
          </p>
        </>
      )}
      <div className="container">
        <Card>
          <Card.Header>The Image</Card.Header>
          <Card.Body>
            <canvas ref={mainCanvas} width={CANVAS_SIZE} height={CANVAS_SIZE} />
            <canvas
              ref={smallCanvas}
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
              style={{ display: "none" }}
            />
            <figcaption className="image-caption">
              A <b>{color}</b>, <b>{shape}</b> shape.
            </figcaption>
            <br />
            <Card.Text>Want a different image?</Card.Text>
            <Button onClick={randomizeImage} disabled={predicting}>
              Random Image
            </Button>
          </Card.Body>
        </Card>
        <Card>
          <Card.Header>The Question</Card.Header>
          <Card.Body>
            <Form>
              <Form.Group controlId="formQuestion">
                <Form.Control
                  as="textarea"
                  placeholder={SAMPLE_QUESTIONS[0]}
                  value={question}
                  onChange={onQuestionChange}
                  disabled={predicting}
                />
              </Form.Group>
            </Form>
            <Card.Text>Want a different question?</Card.Text>
            <Button onClick={randomizeQuestion} disabled={predicting}>
              Random Question
            </Button>
            <hr />
            <Form>
              <div
                style={{
                  marginTop: "8px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                <span>Correct answer according to you ?</span>
              </div>

              <Form.Group
                style={{ width: "258px" }}
                controlId="humanAnswer"
                as="textarea"
                value={correctAnswer}
                placeholder="e.g yes,black,rectangle"
                onChange={onCorrectAnswerChange}
                disabled={predicting}
              ></Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </div>

      <Button
        variant="success"
        size="lg"
        onClick={onPredict}
        style={{
          display: `${display}`,
        }}
        disabled={!newModelLoaded || !benchmarkModelLoaded || predicting}
      >
        {newModelLoaded && benchmarkModelLoaded
          ? predicting
            ? "Predicting..."
            : "Predict"
          : "Loading model..."}
      </Button>
      <br />

      {!!answer ? (
        <div ref={resultCanvas} className="container">
          <Card>
            <Card.Header>Benchmark Approach</Card.Header>
            <Card.Body>
              <AnimatedProgressProvider
                valueStart={0}
                valueEnd={`${(answer[0].benchmarkAccuracy * 100).toFixed(2)}`}
                duration={2.2}
                easingFunction={easeQuadInOut}
              >
                {(value) => {
                  const roundedValue = Math.round(value);
                  return (
                    <CircularProgressbar
                      value={value}
                      text={`${roundedValue}%`}
                      styles={buildStyles({
                        pathTransition: "none",
                        pathColor: `rgba(63,152,199, ${answer[0].benchmarkAccuracy})`,
                      })}
                    />
                  );
                }}
              </AnimatedProgressProvider>
            </Card.Body>
            <Card.Text>
              <Card.Subtitle>{answer[0].benchmarkAnswer}</Card.Subtitle>
            </Card.Text>
          </Card>
          <Card>
            <Card.Header>Our Approach</Card.Header>
            <Card.Body>
              <AnimatedProgressProvider
                valueStart={0}
                valueEnd={`${(answer[1].newAccuracy * 100).toFixed(2)}`}
                duration={1.4}
                easingFunction={easeQuadInOut}
              >
                {(value) => {
                  const roundedValue = Math.round(value);
                  return (
                    <CircularProgressbar
                      value={value}
                      text={`${roundedValue}%`}
                      styles={buildStyles({
                        pathTransition: "none",
                        pathColor: `rgba(63,152,199, ${answer[1].newAccuracy})`,
                      })}
                    />
                  );
                }}
              </AnimatedProgressProvider>
            </Card.Body>
            <Card.Subtitle>{answer[1].newAnswer}</Card.Subtitle>
          </Card>
        </div>
      ) : predicting ? (
        <Alert variant="light">The prediction will appear here soon...</Alert>
      ) : (
        <Alert variant="light">Click Predict!</Alert>
      )}
    </div>
  );
}

export default App;
