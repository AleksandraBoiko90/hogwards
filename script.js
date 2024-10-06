document.addEventListener('DOMContentLoaded', function () {
    fetchStudents();



    function fetchStudents() {
        let url = 'https://hp-api.onrender.com/api/characters/students';

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const currentYear = (new Date()).getFullYear();
                const apiStudents = data.map(s => {
                    return {
                        name: s.name,
                        faculty: s.house,
                        imageUrl: s.image,
                        alternate_names: s.alternate_names,
                        age: currentYear - s.yearOfBirth,
                        wand: s.wand
                    };
                });

                //todo: displayStudents(apiStudents);
            });

    }
});
