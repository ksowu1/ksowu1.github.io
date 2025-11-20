fetch("projects.json")
    .then(response => response.json())
    .then(data => {
        const container = document.getElementById("projects-container");

        data.projects.forEach(project => {
            const card = document.createElement("div");
            card.className = "project-card";

            card.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <a href="${project.link}" target="_blank">View Project</a>
            `;

            container.appendChild(card);
        });
    });
