import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';



// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log(req.body.cityName);
    
    const { cityName } = req.body;
    if (!cityName) {
      return res.status(400).json({ msg: 'City name is required' });
    }

    // GET weather data from city name
    const weatherData = await WeatherService.getWeatherForCity(cityName);

    // Save city to search history
    await HistoryService.addCity(cityName);

    return res.json(weatherData);
  } catch (err) {
    console.log('Error:', err);
    return res.status(500).json({ msg: 'Failed to retrieve weather data', error: err });
    // return err
  }
});

// TODO: GET search history
router.get('/history', async (_req: Request, res: Response) => {
  try {
    const history = await HistoryService.getCities()
    return res.json(history)
  } catch (err) {
    return res.status(500).json({ msg: 'Failed to retrieve history data', error: err });
    // return err
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ msg: 'City id is required' });
    }
    await HistoryService.removeCity(req.params.id);
    return res.json({ success: 'City successfully removed from search history' });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

export default router;
