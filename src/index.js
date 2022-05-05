import { SciChartSurface } from "scichart/Charting/Visuals/SciChartSurface";
import { NumericAxis } from "scichart/Charting/Visuals/Axis/NumericAxis";
import { XyDataSeries } from "scichart/Charting/Model/XyDataSeries";
import { EllipsePointMarker } from "scichart/Charting/Visuals/PointMarkers/EllipsePointMarker";
import { XyScatterRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/XyScatterRenderableSeries";
import { FastLineRenderableSeries } from "scichart/Charting/Visuals/RenderableSeries/FastLineRenderableSeries";
import { ZoomPanModifier } from "scichart/Charting/ChartModifiers/ZoomPanModifier";
import Spline from "../utils/Spline";
import Tangent from "../modifiers/Tangent";

async function initSciChart() {
    const { sciChartSurface, wasmContext } = await SciChartSurface.create("scichart-root");
    SciChartSurface.setRuntimeLicenseKey("");
    const yAxis = new NumericAxis(wasmContext);
    const xAxis = new NumericAxis(wasmContext);
    sciChartSurface.xAxes.add(xAxis);
    sciChartSurface.yAxes.add(yAxis);
    
    const x_values = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    const y_values = [0, 0.5, 1.3, 2.4, 3, 2.5, 2.2, 1.9, 1.2];
    const spline = new Spline(x_values, y_values);

    // Modifiers:
    const zoomPanModifier = new ZoomPanModifier();
    sciChartSurface.chartModifiers.add(zoomPanModifier);
    sciChartSurface.chartModifiers.add(new Tangent(spline));

    // Scatter chart: 
    const scatterSeries = new XyScatterRenderableSeries(wasmContext, {
        pointMarker: new EllipsePointMarker(wasmContext, {
            width: 7,
            height: 7,
            strokeThickness: 6,
            fill: "steelblue",
            stroke: "LightSteelBlue",
        }),
    });
    sciChartSurface.renderableSeries.add(scatterSeries);
    const dataSeries = new XyDataSeries(wasmContext);
    for (let i = 0; i < x_values.length; i++) {
        dataSeries.append(x_values[i], y_values[i]);
    }
    scatterSeries.dataSeries = dataSeries;

    // Line chart: 
    const xyDataLine = new XyDataSeries(wasmContext);
    for (let i = 0; i < 8; i += 0.1) {
        xyDataLine.append(i, spline.FindYof(i));
    }
    const lineSeries = new FastLineRenderableSeries(wasmContext, {
        dataSeries: xyDataLine,
        stroke: "red",
        strokeThickness: 2,
        opacity: 0.7
    });
    sciChartSurface.renderableSeries.add(lineSeries);
}

initSciChart();