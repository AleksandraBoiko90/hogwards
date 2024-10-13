document.addEventListener('DOMContentLoaded', function () {
    let studentsFromApi = [];
    let filter = null;
    let filterByFavourites = false;
    let sortByAge = null;

    fetchStudents().then(displayStudents);
    initFilterByFaculty();
    initFilterByFavourites();
    initSortByAge();
    initAddStudent();

    function initAddStudent() {
        let studentFormMode = null;

        const addEditStudentForm = document.querySelector('.add-edit-student-form');
        const addButton = document.querySelector('.add-user-student');
        addButton.onclick = (e) => {
            e.preventDefault();
            studentFormMode = 'add';
            showAddEditStudentForm();
        };
        const clearButton = document.querySelector('.clear-user-students');
        clearButton.onclick = (e) => {
            e.preventDefault();
            clearAddedStudents();
        };

        addEditStudentForm.onsubmit = onAddEditStudentFormSubmit;

        function showAddEditStudentForm() {
            const header = addEditStudentForm.querySelector('h1');
            switch (studentFormMode) {
                case 'add':
                    header.innerText = 'add new student';
                    break;
                case 'edit':
                    header.innerText = 'edit student';
                    break;

                default:
                    throw new Error("unknown studentFormMode: " + studentFormMode);
            }

            addEditStudentForm.style.display = 'block';
        }

        function hideAddEditStudentForm() {
            addEditStudentForm.style.display = 'none';
        }

        function onAddEditStudentFormSubmit(e) {
            e.preventDefault();
            form = e.target;
            switch (studentFormMode) {
                case 'add':
                    addUserStudent(makeStudentFromForm(form));
                    break;

                default:
                    throw new Error("unknown studentFormMode: " + studentFormMode);
            }
            displayStudents();
            hideAddEditStudentForm();
        }

    }

    function clearAddedStudents() {
        localStorage.setItem('addedStudents', JSON.stringify([]));
        displayStudents();
    }

    function getAddedStudents() {
        const favourites = getFavourites();
        const addedStudents = JSON.parse(localStorage.getItem('addedStudents') || '[]');
        addedStudents.forEach(s => s.isFavourite = favourites.has(s.id));
        return addedStudents;
    }

    function deleteAddedStudent(s) {
        const addedStudents = getAddedStudents();
        const n = addedStudents.indexOf(s);
        addedStudents.splice(n,1);
        localStorage.setItem('addedStudents', JSON.stringify(addedStudents));        
    }

    function addUserStudent(s) {
        const addedStudents = getAddedStudents();
        addedStudents.push(s);
        localStorage.setItem('addedStudents', JSON.stringify(addedStudents));
    }

    function makeStudentFromForm({ name, age, faculty, wand_wood, wand_core, wand_length }) {
        return {
            id: crypto.randomUUID(),
            name: name.value,
            age: age.value ? Number(age.value) : 0,
            faculty: faculty.value,
            imageUrl: 'img/no_photo.jpg',
            alternate_names: null,
            wand: {
                wood: wand_wood.value,
                core: wand_core.value,
                length: wand_length.value
            },
            isFavourite: false,
            origin: 'added',
        }
    }

    function makeStudentFromApi(s, currentYear, isFavourite) {
        return {
            id: s.id,
            name: s.name,
            age: s.yearOfBirth ? currentYear - s.yearOfBirth : 0,
            faculty: s.house,
            imageUrl: s.image || 'img/no_photo.jpg',
            alternate_names: s.alternate_names,
            wand: s.wand,
            isFavourite,
            origin: 'api',
        }
    }
    function initSortByAge() {
        ascButton = document.querySelector('.sort-by-age-asc');
        ascButton.onclick = (e) => sortByAgeAsc(e);
        descButton = document.querySelector('.sort-by-age-desc');
        descButton.onclick = (e) => sortByAgeDesc(e);
        ascButton = document.querySelector('.sort-by-age-unsorted');
        ascButton.onclick = (e) => sortByAgeUnsorted(e);
    }

    function sortByAgeAsc(e) {
        e.preventDefault();
        sortByAge = 'asc';
        displayStudents();
    }
    function sortByAgeDesc(e) {
        e.preventDefault();
        sortByAge = 'desc';
        displayStudents();
    }
    function sortByAgeUnsorted(e) {
        e.preventDefault();
        sortByAge = null;
        displayStudents();
    }

    function initFilterByFaculty() {
        const buttons = [...document.querySelectorAll('.filter-by-faculties a')];
        buttons.forEach(b => b.onclick = (e) => filterByFaculty(e, b));
        function filterByFaculty(e, b) {
            e.preventDefault();
            if (isChecked(b)) {
                uncheck([b]);
                filter = null;
            } else {
                check(b);
                uncheck(buttons.filter(btn => btn !== b));
                filter = b.getAttribute('data-faculty-name');
            }

            displayStudents()

        }
        function uncheck(buttons) {
            buttons.forEach(b => b.style.borderStyle = '');
        }
        function isChecked(b) {
            return b.style.borderStyle !== '';
        }
        function check(b) {
            b.style.borderStyle = 'solid'
        }
    }

    function initFilterByFavourites() {
        const b = document.querySelector('.filter-by-favourites');
        b.onclick = () => { 
            filterByFavourites = !filterByFavourites;
            b.innerText = getFavouritedInnerText(filterByFavourites);
            displayStudents();

        };
    }

    function fetchStudents() {
        let url = 'https://hp-api.onrender.com/api/characters/students';

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                const currentYear = (new Date()).getFullYear();
                const favourites = getFavourites();
                studentsFromApi = data
                    // .slice(0, 5)
                    .map(s => {
                        return makeStudentFromApi(s, currentYear, favourites.has(s.id));
                    });
            });

    }
    
    function deleteApiStudent(s) {
        const n = studentsFromApi.indexOf(s);
        studentsFromApi.splice(n,1);    
    }


    function sortStudentsByAge(allStudents) {
        if (!sortByAge) {
            return;
        }
        switch (sortByAge) {
            case 'asc':
                allStudents.sort((a, b) => a.age - b.age);
                break;
            case 'desc':
                allStudents.sort((a, b) => b.age - a.age);
                break;

            default:
                throw new Error("wrong sort direction: " + sortByAge);

        }

    }

    function displayStudents() {

        const container = document.querySelector('.students-container');
        let allStudents = [...getAddedStudents(), ...studentsFromApi];

        if (filterByFavourites) {
            allStudents = allStudents.filter(s => s.isFavourite);            
        }

        if (filter) {
            allStudents = allStudents.filter(s => s.faculty.toLowerCase() === filter);
        }


        sortStudentsByAge(allStudents);

        const newCards = allStudents.map(s => createStudentCard(s));
        container.replaceChildren(...newCards);

    }


    function createStudentCard(s) {

        const card = document.createElement('div');
        card.classList.add('student-card');
        // card.style.backgroundColor = getFacultyColor(s.faculty);

        addFavouriteButton();
        addImg();
        addName();
        addAge();
        addWandDetails();
        addFaculty();
        addEditButton();
        addDeleteButton();

        addAlternativeNames();
        return card;

        function addWandDetails() {
            const container = document.createElement('div');
            appendChildAndSetInnerText(container, 'h4', 'wand');
            const ul = document.createElement('ul');
            Object.keys(s.wand).forEach((key) =>
                appendChildAndSetInnerText(ul, 'li', `${key}: ${s.wand[key]}`));
            container.appendChild(ul);
            card.appendChild(container);

        }

        function addAge() {
            appendChildAndSetInnerText(card, 'p', 'Age: ' + (s.age > 0 ? s.age : '-'));
        }

        function addAlternativeNames() {
            if (!s.alternate_names) {
                return;
            }
            const container = document.createElement('div');
            appendChildAndSetInnerText(container, 'h4', 'Alt names');
            const ul = document.createElement('ul');
            s.alternate_names.forEach((name) =>
                appendChildAndSetInnerText(ul, 'li', name));
            container.appendChild(ul);
            card.appendChild(container);
        }

        function addDeleteButton() {
            const tag = document.createElement('button');
            tag.innerText = 'Delete';
            tag.onclick = () => {
                switch (s.origin) {
                    case 'api':
                        deleteApiStudent(s);
                        break;
                    case 'added':
                        deleteAddedStudent(s);
                        break;
                    default:
                        throw new Error('unknown origin: ' + s.origin);
                }
                if (isFavourite(s)) {
                    deleteFavourite(s);
                }
                displayStudents();
            };

            card.appendChild(tag);
        }

        function addEditButton() {
            const tag = document.createElement('button');
            tag.innerText = 'Edit';
            card.appendChild(tag);
        }

        function getBackgroundColor(faculty) {
            const colors = { 'gryffindor': 'orange', 'slytherin': 'green', 'hufflepuff': 'yellow', 'ravenclaw': 'blue' };
            return colors[faculty];
        }

        function addFaculty() {
            const tag = document.createElement('p');
            tag.innerText = s.faculty;
            card.appendChild(tag);
            card.style.backgroundColor = getBackgroundColor(s.faculty.toLowerCase());
        }

        function addName() {
            const tag = document.createElement('h3');
            tag.innerText = s.name;
            card.appendChild(tag);
        }

        function addImg() {
            const tag = document.createElement('img');
            tag.setAttribute('src', s.imageUrl);
            tag.setAttribute('alt', s.name + " photo");
            card.appendChild(tag);
        }

        function addFavouriteButton() {
            const tag = document.createElement('span');
            tag.classList.add("favourite");
            tag.innerText = getFavouritedInnerText(s.isFavourite);
            tag.onclick = () => toggleFavourite(s, tag);
            card.appendChild(tag);

        }


    }//createStudentCard

    function getFavouritedInnerText(isFavourite) {
        return isFavourite ? '♥️' : '♡'
    }
    
    function toggleFavourite(s, tag) {

        if (!s.isFavourite && !canAddFavourite()) {
            alert("can't add more favourites");
            return;
        }
        s.isFavourite = !s.isFavourite;
        tag.innerText = getFavouritedInnerText(s.isFavourite);
        if (s.isFavourite) {
            addFavourite(s);
        } else {
            deleteFavourite(s);
        }
    }

    function addFavourite(s) {
        const favourites = getFavourites();
        favourites.add(s.id);
        localStorage.setItem('favourites', JSON.stringify([...favourites]));
    }

    function isFavourite(s) {
        const favourites = getFavourites();
        return favourites.has(s.id);
    }

    function deleteFavourite(s) {
        const favourites = getFavourites();
        favourites.delete(s.id);
        localStorage.setItem('favourites', JSON.stringify([...favourites]));

    }

    function getFavourites() {
        return new Set(JSON.parse(localStorage.getItem('favourites') || '[]'));
    }

    function canAddFavourite() {
        return getFavourites().size < 3;
    }

    function appendChildAndSetInnerText(parent, tagName, innerText) {
        const tag = document.createElement(tagName);
        tag.innerText = innerText;
        parent.appendChild(tag);
    }


});//document.addEventListener('DOMContentLoaded', function () {
