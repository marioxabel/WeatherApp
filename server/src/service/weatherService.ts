import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  latitude: number
  longitude: number
}

// TODO: Define a class for the Weather object
class Weather {
  city: string
  date: string
  icon: string
  iconDescription: string
  tempF: number
  windSpeed: number
  humidity: number

  constructor(
    city: string,
    date: string,
    icon: string,
    iconDescription: string,
    tempF: number,
    windSpeed: number,
    humidity: number
  ) {
    this.city = city
    this.date = date
    this.icon = icon
    this.iconDescription = iconDescription
    this.tempF = tempF
    this.windSpeed = windSpeed
    this.humidity = humidity
  }

}

// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  baseURL: string
  apiKey: string
  cityName: string

  constructor(cityName?: string) {
    this.baseURL = process.env.API_BASE_URL || ''
    this.apiKey = process.env.API_KEY || ''
    this.cityName = cityName || ''
  }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    try {
      const response = await fetch(query) 
      const data = await response.json()
      const locationData = data.city.coord

      return locationData
      
    } catch (err) {
      console.log('Error: ',err)
      return err
    }
  }
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: any): Coordinates {
    const { lat, lon } = locationData
    return {
      latitude: lat,
      longitude: lon
    }
  }
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    return  `${this.baseURL}/data/2.5/forecast?q=${this.cityName}&appid=${this.apiKey}`
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const { latitude, longitude } = coordinates
    return `${this.baseURL}/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}`
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    const query = this.buildGeocodeQuery()
    const locationData = await this.fetchLocationData(query)
    const coordinates = this.destructureLocationData(locationData)

    return coordinates
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const weatherQuery = this.buildWeatherQuery(coordinates)
      const weatherData = await fetch(weatherQuery)

      return await weatherData.json()
    } catch (err) {
      console.log('Error: ',err)
      return err
    }
  }
   // TODO: Build parseCurrentWeather method
   private parseCurrentWeather(data: any): Weather {
    const city = this.cityName;
    const date = new Date(data.list[0].dt * 1000).toLocaleDateString(); // Convert to local date string
    const icon = data.list[0].weather[0].icon;
    const iconDescription = data.list[0].weather[0].description;
    const tempF = parseFloat(((data.list[0].main.temp - 273.15) * 9 / 5 + 32).toFixed(2)); // Convert to number and Convert from Kelvin to Fahrenheit
    const windSpeed = data.list[0].wind.speed;
    const humidity = data.list[0].main.humidity;

    return new Weather(city, date, icon, iconDescription, tempF, windSpeed, humidity);
  }

  private buildForecastArray(weatherData: any[]): Weather[] {
    const forecast: Weather[] = [];
    const uniqueDates: Set<string> = new Set();

    weatherData.forEach((entry: any) => {
      const date = entry.dt_txt.split(' ')[0]; // Extract date part only
      if (!uniqueDates.has(date) && uniqueDates.size < 5) {
        uniqueDates.add(date);

        const city = this.cityName;
        const formattedDate = new Date(entry.dt * 1000).toLocaleDateString(); // Format date for display
        const icon = entry.weather[0].icon;
        const iconDescription = entry.weather[0].description;
        const tempF = parseFloat(((entry.main.temp - 273.15) * 9 / 5 + 32).toFixed(2)); // Convert from Kelvin to Fahrenheit
        const windSpeed = entry.wind.speed;
        const humidity = entry.main.humidity;

        forecast.push(new Weather(city, formattedDate, icon, iconDescription, tempF, windSpeed, humidity));
      }
    });

    return forecast;
  }

  async getWeatherForCity(city: string): Promise<Weather[]> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData();
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(weatherData.list);
    return [currentWeather, ...forecast];
  }
}



export default new WeatherService()

