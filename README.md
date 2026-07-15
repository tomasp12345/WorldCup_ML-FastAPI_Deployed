# World cup predictor
This project consists of a way of predicting the probabilities of any result given 2 countries. The project is divided in:
- Model Creation: This starts with collecting the necessary data. I found a data source with all the international games
from decades ago to the present day and decided to use the games from the last 4 years to the date for the training. I used
poisson regressor from scikit-learn because of its nature of predicting an amount of events. The model is pretty simple as of
right now but i plan on doing some changes. I used the amounts of goals as my "y variables". Right now the model is basically just
learning from the elo rankings created by the fifa. This is partly because getting specific statistics is a whole challenge because of
the data scraping protections.
- Backend: The backend was made using Python + FastApi and deployed in render. I tried to use hugging spaces but the docker space was
only available with a paid subscription. To do this backend i had to learn how to use joblib to use the model i created in my .ipynb,
but in my .py file to be able to use it with FastAPI.
- Frontend: For the front i used JavaScript+VITE and i deployed it with vercel. I had used vercel before so it was easier this time.
# Notes:
- This project does not include a database system. There is no login and no personalized experience since the main goal was to learn
how to deploy a ML model.
- The model still needs work, as mentioned it is a very simple model.
- I learned that sometimes the data collection can be one of the most complex parts in the cycle of deploying a model and creating it from scratch.
