import http from "k6/http";
import { group, check } from "k6";

const BASE_URL = "http://weather-api.spiva.today";

export let options = {
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
    scenarios: {
        open_model: {
          executor: 'constant-arrival-rate',
          rate: 270,
          timeUnit: '1s',
          duration: '10m',
          preAllocatedVUs: 100,
          gracefulStop: '0s',
        },
      },    
  };

export function setup() {
    console.log(`Test started: ${new Date().toLocaleString( 'ru', { timeZoneName: 'short' } )}`);
}

export default function () {
    group("/Forecast", () => {
        {
            let url = BASE_URL + `/Forecast`;
            let request = http.get(url);

            check(request, {
                "Success": (r) => r.status === 200
            });
        }
    });
}

export function teardown(data) {
    console.log(`Test ended: ${new Date().toLocaleString( 'ru', { timeZoneName: 'short' } )}`);
}