import "./styles.css";
import {
  ReferenceLine,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { ChartDataService } from "./services/chart-data-service";
import { useAsync } from "react-async";
import { ChartDataModel } from "./models/ChartModels";

export default function App(): any {
  const dataService = new ChartDataService();

  const { data, error, isPending } = useAsync<ChartDataModel>({
    promiseFn: dataService.getData,
  });
  if (error) return error.message;
  if (isPending) return "Pending...";
  if (!data) return "Something wrong.";

  const { views, uvPercentage, pvPercentage, uvInterval, pvInterval } = data;

  const redLine = (percentage: number) => (
    <stop offset={`${percentage}%`} stopColor="red" key={Math.random()} />
  );
  const turquoiseLine = (percentage: number) => (
    <stop offset={`${percentage}%`} stopColor="#82ca9d" key={Math.random()} />
  );
  const blueLine = (percentage: number) => (
    <stop offset={`${percentage}%`} stopColor="#8884d8" key={Math.random()} />
  );

  const vuv = views.map((d) => d.uv);
  const vpv = views.map((d) => d.pv);

  function generateLinearGradient(
    gradientId: string,
    firstColor: Function,
    secondColor: Function,
    views: number[],
    percentage : number[],
    interval : number[],
  ): JSX.Element {
    return (
      <linearGradient
        id = {gradientId}
        x1="0"
        y1="0"
        x2="100%"
        y2="0"
        key={Math.random()}
      >
        {percentage.map(function (curr, index, array) {
          if (index === 0) {
            const cond1 =
              views[0] >=
              Math.max(Number(interval[1]), Number(interval[0]));
            const cond2 =
              views[0] <=
              Math.min(Number(interval[1]), Number(interval[0]));
            if (cond1 && cond2) {
              colorTurn = !colorTurn;
              return secondColor(curr as number);
            }
            if (!cond1 && !cond2) {
              return firstColor(curr);
            }
          }
          if (index === array.length - 1) {
            if (colorTurn) {
              colorTurn = false;
              return secondColor(curr);
            } else {
              colorTurn = false;
              return firstColor(curr);
            }
          }

          if (colorTurn) {
            colorTurn = false;
            return (
              <>
                {secondColor(curr)}
                {firstColor(curr)}
              </>
            );
          } else {
            colorTurn = true;
            return (
              <>
                {firstColor(curr)}
                {secondColor(curr)}
              </>
            );
          }
        })}
      </linearGradient>
    );
  }

  let colorTurn = false;
  return (
    <LineChart
      width={500}
      height={300}
      data={views}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <defs key={Math.random()}>
      {generateLinearGradient("uvGradient", turquoiseLine, redLine, vuv, uvPercentage, uvInterval)}

      {generateLinearGradient("pvGradient", blueLine, redLine, vpv, pvPercentage, pvInterval)}
      </defs>

      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <ReferenceLine y={uvInterval[0]} stroke="#82ca9d" />
      <ReferenceLine y={uvInterval[1]} stroke="#82ca9d" />
      <ReferenceLine y={pvInterval[0]} stroke="#8884d8" />
      <ReferenceLine y={pvInterval[1]} stroke="#8884d8" />
      <Line
        type="linear"
        dataKey="pv"
        stroke="url(#pvGradient)"
        activeDot={{ r: 8 }}
      />
      <Line type="linear" dataKey="uv" stroke="url(#uvGradient)" />
    </LineChart>
  );
}
