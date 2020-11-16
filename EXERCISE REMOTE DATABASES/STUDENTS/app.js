function solve() {
  let url = "https://students-91195.firebaseio.com/Students/.json";
  let form = document.querySelector("table tbody");
  // It would be best to display the students on initial load instead of making a one-time button to do that.
  // The Submit button that I have added, re-loads the students, so another load button is redundant.
  displayStudents();
  function displayStudents() {
    fetch(url)
      .then((response) => response.json())
      .then((obj) => {
        // Cleaning the form, so I wont get any duplicate records displayed when I press the Submit button.
        form.textContent = "";
        Object.keys(obj).forEach((key) => {
          let trEl = document.createElement("tr");
          let tdEl = document.createElement("td");
          let tdElTwo = document.createElement("td");
          let tdElThree = document.createElement("td");
          let tdElFour = document.createElement("td");
          let tdElFive = document.createElement("td");
          tdEl.innerText = obj[key].ID;
          tdElTwo.innerText = obj[key].firstName;
          tdElThree.innerText = obj[key].lastName;
          tdElFour.innerText = obj[key].facultyNumber;
          tdElFive.innerText = obj[key].grade;
          trEl.appendChild(tdEl);
          trEl.appendChild(tdElTwo);
          trEl.appendChild(tdElThree);
          trEl.appendChild(tdElFour);
          trEl.appendChild(tdElFive);
          form.appendChild(trEl);

          // I love this sorting method
          let sortedArr = [...form.children].sort(
            (a, b) => a.firstChild.innerText - b.firstChild.innerText
          );
          while (form.firstChild) {
            form.removeChild(form.firstChild);
          }
          for (const name of sortedArr) {
            form.appendChild(name);
          }
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  let submitButton = document.getElementById("submit");

  submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    let id = document.getElementById("ID");
    let firstName = document.getElementById("first-name");
    let lastName = document.getElementById("last-name");
    let facultyNumber = document.getElementById("faculty-number");
    let grade = document.getElementById("grade");

    // That way we will have correct Grade values
    if (
      Number(id.value.trim()) &&
      firstName.value.trim() !== "" &&
      lastName.value.trim() !== "" &&
      Number(facultyNumber.value.trim()) &&
      Number(grade.value.trim()) >= 2 &&
      Number(grade.value.trim()) <= 6
    ) {
      // That way we will have unique IDs
      if (
        [...form.children].find((el) => el.firstChild.innerText == id.value)
      ) {
        alert("That ID is already taken!");
        return;
      }
      // That way we will have unique Faculty Numbers
      if (
        [...form.children].find(
          (el) => el.children[3].innerText == facultyNumber.value
        )
      ) {
        alert("That Faculty Number is already taken!");
        return;
      }
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          ID: id.value,
          firstName: firstName.value,
          lastName: lastName.value,
          grade: Number(grade.value).toFixed(2),
          facultyNumber: facultyNumber.value,
        }),
      }).catch((error) => {
        console.error("Error:", error);
      });

      // Cleaning the input fields, to make it look all nice
      [
        id.value,
        firstName.value,
        lastName.value,
        facultyNumber.value,
        grade.value,
      ] = ["", "", "", "", ""];

      // I set this timeout to allow some time for the POST request to be completed before making a GET request
      setTimeout(() => {
        displayStudents();
      }, 200);
    } else {
      alert(
        "All fields must be filled and the grade must be a value between 2 and 6!"
      );
    }
  });
}

solve();
