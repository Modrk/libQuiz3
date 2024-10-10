const nextQbtn = document.getElementById("btn");
const imgElem = document.getElementById("img");
const quizForm = document.getElementById("quiz-form");
const result = document.getElementById("result");
const qCounter = document.getElementById("question-counter");
const qAmount = document.getElementById("question-amount");

let img = new Image();
img.classList.add("d-block", "img-fluid");
img.style.maxHeight = "500px";
imgElem.appendChild(img);

const resultImgContainer = document.createElement("div");
resultImgContainer.classList.add("py-3");
const pResults = document.createElement("p");
pResults.classList.add("mt-2", "lead");

let imageCounter = 0;
const wrongAnswers = [];
const base_url = "./images/";
const imageCache = {};


function saveImage(obj) {
    const { id, filename } = obj
    fetch(base_url + filename)
        .then(response => response.blob())
        .then(blob => {
            imageCache[id] = blob;
        });
}


const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
};


function showResults(data) {
    quizForm.classList.add("d-none", "invisible");
    const correctTotal = data.length - wrongAnswers.length;
    result.innerHTML += `<p class=\"pt-3\">You gave the correct answer to <strong>${Math.round(1000*correctTotal/data.length)/10}%</strong> of the questions (${correctTotal}/${data.length}).</p>`;
    if (wrongAnswers.length) {
        result.innerHTML += "<p class=\"pt-5\">Check these pictures again (<span class=\"text-success fw-bold\">green</span> = libs, <span class=\"text-danger fw-bold\">red</span> = not libs):</p>";
        wrongAnswers.forEach(({id, correct, explanation}) => {
            let container = resultImgContainer.cloneNode();
            let p = pResults.cloneNode();
            let i = img.cloneNode();
            i.src = URL.createObjectURL(imageCache[id]);
            correct ? i.classList.add("border-green") : i.classList.add("border-red");
            p.innerText = explanation;
            container.appendChild(i);
            container.appendChild(p);
            result.appendChild(container);
        });
    }
    result.classList.remove("invisible");
}


function showImage(data) {
    const answer = document.querySelector('input[name="answer"]:checked')?.value;
    if (answer) {
        if (data[imageCounter].correct !== ~~answer) {
            wrongAnswers.push(data[imageCounter]);
        }
        if (imageCounter < data.length - 1) {
            img.src = URL.createObjectURL(imageCache[data[imageCounter+1].id]);

            if (imageCounter < data.length - 2) {
                saveImage(data[imageCounter+2]);
            }
            imageCounter++;
        } else {
            showResults(data);
        }
        document.querySelector('input[name="answer"]:checked').checked = false;
        qCounter.innerText = imageCounter + 1;
    }
}


function prepare(data) {
    shuffleArray(data);
    qAmount.innerText = data.length;
    saveImage(data[imageCounter]);
    img.src = base_url + data[imageCounter].filename;
    
    saveImage(data[imageCounter+1]);
    nextQbtn.addEventListener("click", () => {
        showImage(data);
    });
}

const fetchData = async () => {
    try {
        const res = await fetch("./data.json");
        const data = await res.json();
        prepare(data.data)
    } catch (err) {
        console.log(err);
    }
};


fetchData();