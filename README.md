
## Submission Guidelines

* Push code to a **public GitHub repository**.
* Include a **README** with:

  * Setup & installation steps
  * How to run the project
  * API documentation link or instructions
* **Deployment (optional):** Extra points for working demo on Render/Heroku/Vercel.

---



Guide
- RATE_LIMIT_MAX_REQUESTS -> set this value to check rate limit in give time window 
  - Right now in env api 100 request is set every -> 15 minutes
- To run whole api setup run this command -> `docker compose up -d ` 
  - Make sure docker is installed in your system
- To closed and end running apis -> run this command -> `docker composer down`