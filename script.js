document.addEventListener('DOMContentLoaded', function () {
    fetchStudents().then(students => {
        displayStudents(students);


    });

    function fetchStudents() {
        let url = 'https://hp-api.onrender.com/api/characters/students';

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                const currentYear = (new Date()).getFullYear();
                const students = data.map(s => {
                    return {
                        id: s.id,
                        name: s.name,
                        faculty: s.house,
                        imageUrl: s.image,
                        alternate_names: s.alternate_names,
                        age: currentYear - s.yearOfBirth,
                        wand: s.wand
                    };
                });
                return students;
            });

    }

    function displayStudents(students) {

        const container = document.querySelector('.students-container');
        students.forEach(s => {
            container.appendChild(createStudentCard(s));
        });

    }


    function createStudentCard(s) {
        const card = document.createElement('div');
        card.classList.add('student-card');
        // card.style.backgroundColor = getFacultyColor(s.faculty);

        


        card.innerHTML = `
        <img src="${s.imageUrl}" alt="${s.name}" style="height:100px;">
        <h3>${s.name}</h3>
        <p>Faculty: ${s.faculty}</p>
        
        <button class="save-button" >Save</button>
        <button class="delete-button" >Delete</button>
        <button class="edit-button" >Edit</button>
        `;

        return card;
    }



});//document.addEventListener('DOMContentLoaded', function () {
