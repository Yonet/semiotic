import React from "react";

import Axis from "../Axis";
import Mark from "../Mark";
import { contouring } from "../svg/areaDrawing";
import { quantile } from "d3-array";
import { histogram, max } from "d3-array";
import { groupBarMark } from "../svg/SvgHelper";
import { area, line, curveCatmullRom, arc } from "d3-shape";
import { pointOnArcAtAngle } from "./pieceDrawing";
import { orFrameSummaryRenderer } from "./frameFunctions";
import { scaleLinear } from "d3-scale";

const contourMap = d => [d.xy.x, d.xy.y];

const verticalXYSorting = (a, b) => a.xy.y - b.xy.y;
const horizontalXYSorting = (a, b) => b.xy.x - a.xy.x;
const emptyObjectReturnFn = () => ({});

export function boxplotRenderFn({
  data,
  type,
  renderMode,
  eventListenersGenerator,
  styleFn,
  classFn,
  positionFn = position => position,
  projection,
  adjustedSize,
  margin,
  chartSize
}) {
  const summaryElementStylingFn = type.elementStyleFn || emptyObjectReturnFn;

  const keys = Object.keys(data);
  const renderedSummaryMarks = [];
  keys.forEach((key, summaryI) => {
    const summary = data[key];
    const eventListeners = eventListenersGenerator(summary, summaryI);

    const columnWidth = summary.width;

    const thisSummaryData = summary.pieceData;

    const calculatedSummaryStyle = styleFn(thisSummaryData[0], summaryI);
    const calculatedSummaryClass = classFn(thisSummaryData[0], summaryI);

    let summaryDataNest,
      translate,
      extentlineX1,
      extentlineX2,
      extentlineY1,
      extentlineY2,
      topLineX1,
      topLineX2,
      midLineX1,
      midLineX2,
      bottomLineX1,
      bottomLineX2,
      rectTopWidth,
      rectTopHeight,
      rectTopY,
      rectTopX,
      rectBottomWidth,
      rectBottomHeight,
      rectBottomY,
      rectBottomX,
      rectWholeWidth,
      rectWholeHeight,
      rectWholeY,
      rectWholeX,
      topLineY1,
      topLineY2,
      bottomLineY1,
      bottomLineY2,
      midLineY1,
      midLineY2;

    const renderValue = renderMode ? renderMode(summary, summaryI) : undefined;

    if (projection === "vertical") {
      summaryDataNest = thisSummaryData
        .map(p => chartSize - p._orFR)
        .sort((a, b) => b - a);

      summaryDataNest = [
        quantile(summaryDataNest, 0.0),
        quantile(summaryDataNest, 0.25),
        quantile(summaryDataNest, 0.5),
        quantile(summaryDataNest, 0.75),
        quantile(summaryDataNest, 1.0)
      ];

      const xPosition = positionFn(summary.middle, key, summaryI);

      translate = `translate(${xPosition},${margin.top})`;
      extentlineX1 = 0;
      extentlineX2 = 0;
      extentlineY1 = summaryDataNest[0];
      extentlineY2 = summaryDataNest[4];
      topLineX1 = -columnWidth / 2;
      topLineX2 = columnWidth / 2;
      midLineX1 = -columnWidth / 2;
      midLineX2 = columnWidth / 2;
      bottomLineX1 = -columnWidth / 2;
      bottomLineX2 = columnWidth / 2;
      rectBottomWidth = columnWidth;
      rectBottomHeight = summaryDataNest[1] - summaryDataNest[2];
      rectBottomY = summaryDataNest[2];
      rectBottomX = -columnWidth / 2;
      rectTopWidth = columnWidth;
      rectTopHeight = summaryDataNest[2] - summaryDataNest[3];
      rectWholeWidth = columnWidth;
      rectWholeHeight = summaryDataNest[1] - summaryDataNest[3];
      rectWholeY = summaryDataNest[3];
      rectWholeX = -columnWidth / 2;
      rectTopY = summaryDataNest[3];
      rectTopX = -columnWidth / 2;
      topLineY1 = summaryDataNest[0];
      topLineY2 = summaryDataNest[0];
      bottomLineY1 = summaryDataNest[4];
      bottomLineY2 = summaryDataNest[4];
      midLineY1 = summaryDataNest[2];
      midLineY2 = summaryDataNest[2];
    } else if (projection === "horizontal") {
      summaryDataNest = thisSummaryData.map(p => p._orFR).sort((a, b) => a - b);

      summaryDataNest = [
        quantile(summaryDataNest, 0.0),
        quantile(summaryDataNest, 0.25),
        quantile(summaryDataNest, 0.5),
        quantile(summaryDataNest, 0.75),
        quantile(summaryDataNest, 1.0)
      ];

      const yPosition = positionFn(summary.middle, key, summaryI);

      translate = `translate(0,${yPosition})`;
      extentlineY1 = 0;
      extentlineY2 = 0;
      extentlineX1 = summaryDataNest[0];
      extentlineX2 = summaryDataNest[4];
      topLineY1 = -columnWidth / 2;
      topLineY2 = columnWidth / 2;
      midLineY1 = -columnWidth / 2;
      midLineY2 = columnWidth / 2;
      bottomLineY1 = -columnWidth / 2;
      bottomLineY2 = columnWidth / 2;
      rectTopHeight = columnWidth;
      rectTopWidth = summaryDataNest[3] - summaryDataNest[2];
      rectTopX = summaryDataNest[2];
      rectTopY = -columnWidth / 2;
      rectBottomHeight = columnWidth;
      rectBottomWidth = summaryDataNest[2] - summaryDataNest[1];
      rectBottomX = summaryDataNest[1];
      rectBottomY = -columnWidth / 2;
      rectWholeHeight = columnWidth;
      rectWholeWidth = summaryDataNest[3] - summaryDataNest[1];
      rectWholeX = summaryDataNest[1];
      rectWholeY = -columnWidth / 2;
      topLineX1 = summaryDataNest[0];
      topLineX2 = summaryDataNest[0];
      bottomLineX1 = summaryDataNest[4];
      bottomLineX2 = summaryDataNest[4];
      midLineX1 = summaryDataNest[2];
      midLineX2 = summaryDataNest[2];
    }

    if (projection === "radial") {
      summaryDataNest = thisSummaryData
        .map(p => p._orFR - margin.left)
        .sort((a, b) => a - b);

      summaryDataNest = [
        quantile(summaryDataNest, 0.0),
        quantile(summaryDataNest, 0.25),
        quantile(summaryDataNest, 0.5),
        quantile(summaryDataNest, 0.75),
        quantile(summaryDataNest, 1.0)
      ];

      extentlineX1 = 0;
      extentlineX2 = 0;
      extentlineY1 = summaryDataNest[0];
      extentlineY2 = summaryDataNest[4];
      topLineX1 = -columnWidth / 2;
      topLineX2 = columnWidth / 2;
      midLineX1 = -columnWidth / 2;
      midLineX2 = columnWidth / 2;
      bottomLineX1 = -columnWidth / 2;
      bottomLineX2 = columnWidth / 2;
      rectTopWidth = columnWidth;
      rectTopHeight = summaryDataNest[1] - summaryDataNest[3];
      rectTopY = summaryDataNest[3];
      rectTopX = -columnWidth / 2;
      rectBottomWidth = columnWidth;
      rectBottomHeight = summaryDataNest[1] - summaryDataNest[3];
      rectBottomY = summaryDataNest[3];
      rectBottomX = -columnWidth / 2;
      topLineY1 = summaryDataNest[0];
      topLineY2 = summaryDataNest[0];
      bottomLineY1 = summaryDataNest[4];
      bottomLineY2 = summaryDataNest[4];
      midLineY1 = summaryDataNest[2];
      midLineY2 = summaryDataNest[2];

      const twoPI = Math.PI * 2;

      const bottomLineArcGenerator = arc()
        .innerRadius(bottomLineY1 / 2)
        .outerRadius(bottomLineY1 / 2);
      //        .padAngle(summary.pct_padding * twoPI);

      const topLineArcGenerator = arc()
        .innerRadius(topLineY1 / 2)
        .outerRadius(topLineY1 / 2);
      //        .padAngle(summary.pct_padding * twoPI);

      const midLineArcGenerator = arc()
        .innerRadius(midLineY1 / 2)
        .outerRadius(midLineY1 / 2);
      //        .padAngle(summary.pct_padding * twoPI);

      const bodyArcTopGenerator = arc()
        .innerRadius(summaryDataNest[1] / 2)
        .outerRadius(midLineY1 / 2);
      //        .padAngle(summary.pct_padding * twoPI);

      const bodyArcBottomGenerator = arc()
        .innerRadius(midLineY1 / 2)
        .outerRadius(summaryDataNest[3] / 2);
      //        .padAngle(summary.pct_padding * twoPI);

      const bodyArcWholeGenerator = arc()
        .innerRadius(summaryDataNest[1] / 2)
        .outerRadius(summaryDataNest[3] / 2);
      //        .padAngle(summary.pct_padding * twoPI);

      let startAngle = summary.pct_start + summary.pct_padding / 2;
      let endAngle = summary.pct + summary.pct_start - summary.pct_padding / 2;
      let midAngle = summary.pct / 2 + summary.pct_start;
      startAngle *= twoPI;
      endAngle *= twoPI;

      //        const bottomPoint = bottomLineArcGenerator.centroid({ startAngle, endAngle })
      //        const topPoint = topLineArcGenerator.centroid({ startAngle, endAngle })
      const bottomPoint = pointOnArcAtAngle(
        [0, 0],
        midAngle,
        summaryDataNest[4] / 2
      );
      const topPoint = pointOnArcAtAngle(
        [0, 0],
        midAngle,
        summaryDataNest[0] / 2
      );

      translate = `translate(${adjustedSize[0] / 2 +
        margin.left},${adjustedSize[1] / 2 + margin.top})`;

      renderedSummaryMarks.push(
        <g
          {...eventListeners}
          className={calculatedSummaryClass}
          transform={translate}
          key={`summaryPiece-${summaryI}`}
        >
          <Mark
            renderMode={renderValue}
            markType="line"
            x1={bottomPoint[0]}
            x2={topPoint[0]}
            y1={bottomPoint[1]}
            y2={topPoint[1]}
            style={Object.assign(
              { strokeWidth: 2 },
              calculatedSummaryStyle,
              summaryElementStylingFn("whisker")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="path"
            d={topLineArcGenerator({ startAngle, endAngle })}
            style={Object.assign(
              { strokeWidth: 4 },
              calculatedSummaryStyle,
              { fill: "none" },
              summaryElementStylingFn("max")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="path"
            d={midLineArcGenerator({ startAngle, endAngle })}
            style={Object.assign(
              { strokeWidth: 4 },
              calculatedSummaryStyle,
              { fill: "none" },
              summaryElementStylingFn("median")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="path"
            d={bottomLineArcGenerator({ startAngle, endAngle })}
            style={Object.assign(
              { strokeWidth: 4 },
              calculatedSummaryStyle,
              { fill: "none" },
              summaryElementStylingFn("min")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="path"
            d={bodyArcWholeGenerator({ startAngle, endAngle })}
            style={Object.assign(
              { strokeWidth: 4 },
              calculatedSummaryStyle,
              summaryElementStylingFn("iqrarea")
            )}
          />

          <Mark
            renderMode={renderValue}
            markType="path"
            d={bodyArcTopGenerator({ startAngle, endAngle })}
            style={Object.assign(
              {},
              calculatedSummaryStyle,
              { fill: "none", stroke: "none" },
              summaryElementStylingFn("q3area")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="path"
            d={bodyArcBottomGenerator({ startAngle, endAngle })}
            style={Object.assign(
              {},
              calculatedSummaryStyle,
              { fill: "none", stroke: "none" },
              summaryElementStylingFn("q1area")
            )}
          />
        </g>
      );
    } else {
      renderedSummaryMarks.push(
        <g
          {...eventListeners}
          className={calculatedSummaryClass}
          transform={translate}
          key={`summaryPiece-${summaryI}`}
        >
          <Mark
            renderMode={renderValue}
            markType="line"
            x1={extentlineX1}
            x2={extentlineX2}
            y1={extentlineY1}
            y2={extentlineY2}
            style={Object.assign(
              { strokeWidth: "2px" },
              calculatedSummaryStyle,
              summaryElementStylingFn("whisker")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="line"
            x1={topLineX1}
            x2={topLineX2}
            y1={topLineY1}
            y2={topLineY2}
            style={Object.assign(
              { strokeWidth: "2px" },
              calculatedSummaryStyle,
              summaryElementStylingFn("min")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="line"
            x1={bottomLineX1}
            x2={bottomLineX2}
            y1={bottomLineY1}
            y2={bottomLineY2}
            style={Object.assign(
              { strokeWidth: "2px" },
              calculatedSummaryStyle,
              summaryElementStylingFn("max")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="rect"
            x={rectWholeX}
            width={rectWholeWidth}
            y={rectWholeY}
            height={rectWholeHeight}
            style={Object.assign(
              { strokeWidth: "1px" },
              calculatedSummaryStyle,
              summaryElementStylingFn("iqrarea")
            )}
          />

          <Mark
            renderMode={renderValue}
            markType="rect"
            x={rectTopX}
            width={rectTopWidth}
            y={rectTopY}
            height={rectTopHeight}
            style={Object.assign(
              {},
              calculatedSummaryStyle,
              { fill: "none", stroke: "none" },
              summaryElementStylingFn("q3area")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="rect"
            x={rectBottomX}
            width={rectBottomWidth}
            y={rectBottomY}
            height={rectBottomHeight}
            style={Object.assign(
              {},
              calculatedSummaryStyle,
              { fill: "none", stroke: "none" },
              summaryElementStylingFn("q1area")
            )}
          />
          <Mark
            renderMode={renderValue}
            markType="line"
            x1={midLineX1}
            x2={midLineX2}
            y1={midLineY1}
            y2={midLineY2}
            style={Object.assign(
              { strokeWidth: "2px" },
              calculatedSummaryStyle,
              summaryElementStylingFn("median")
            )}
          />
        </g>
      );
    }
  });

  return renderedSummaryMarks;
}

export function contourRenderFn({
  data,
  type,
  renderMode,
  eventListenersGenerator,
  styleFn,
  classFn,
  projection,
  adjustedSize,
  margin,
  chartSize
}) {
  const keys = Object.keys(data);
  const renderedSummaryMarks = [];
  keys.forEach((key, ordsetI) => {
    const ordset = data[key];
    const renderValue = renderMode && renderMode(ordset, ordsetI);
    type.thresholds = type.thresholds || 8;
    type.bandwidth = type.bandwidth || 12;
    type.resolution = type.resolution || 1000;

    const projectedOrd = [
      { id: ordset, _xyfCoordinates: ordset.xyData.map(contourMap) }
    ];

    const oContours = contouring({
      areaType: type,
      data: projectedOrd,
      projectedX: "x",
      projectedY: "y",
      finalXExtent: [0, adjustedSize[0]],
      finalYExtent: [0, adjustedSize[1]]
    });
    const contourMarks = [];
    oContours.forEach((d, i) => {
      d.coordinates.forEach((coords, ii) => {
        const eventListeners = eventListenersGenerator(d, i);
        contourMarks.push(
          <Mark
            {...eventListeners}
            renderMode={renderValue}
            simpleInterpolate={true}
            key={`${i}-${ii}`}
            style={styleFn(ordset.pieceData[0], ordsetI)}
            markType={"path"}
            d={`M${d.coordinates[0].map(p => p.join(",")).join("L")}Z`}
          />
        );
      });
    });

    renderedSummaryMarks.push(
      <g key={`contour-container-${ordsetI}`}>{contourMarks}</g>
    );
  });
  return renderedSummaryMarks;
}

function axisGenerator(axisProps, i, axisScale) {
  return (
    <Axis
      label={axisProps.label}
      key={axisProps.key || `orframe-summary-axis-${i}`}
      orient={axisProps.orient}
      size={axisProps.size}
      margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
      ticks={axisProps.ticks}
      tickSize={axisProps.tickSize}
      tickFormat={axisProps.tickFormat}
      tickValues={axisProps.tickValues}
      format={axisProps.format}
      rotate={axisProps.rotate}
      scale={axisScale}
      className={axisProps.className}
      name={axisProps.name}
    />
  );
}

function radialAxisGenerator(axisProps) {
  return <circle style={{ fill: "pink" }} r={20} />;
}

export function bucketizedRenderingFn({
  data,
  type,
  renderMode,
  eventListenersGenerator,
  styleFn,
  classFn,
  projection,
  adjustedSize,
  margin,
  chartSize
}) {
  const renderedSummaryMarks = [];

  const buckets = type.bins || 25;
  const summaryValueAccessor = type.binValue || (d => d.length);
  let axisCreator;
  if (type.axis) {
    type.axis.orient =
      projection === "horizontal" &&
      ["left", "right"].indexOf(type.axis.orient) === -1
        ? "left"
        : type.axis.orient;
    type.axis.orient =
      projection === "vertical" &&
      ["bottom", "top"].indexOf(type.axis.orient) === -1
        ? "bottom"
        : type.axis.orient;
    axisCreator = axisGenerator;
    if (projection === "radial") {
      console.error("Summary axes cannot be drawn for radial histograms");
      axisCreator = () => null;
    }
  }

  const bucketSize = chartSize / buckets;

  const keys = Object.keys(data);
  let binMax = 0;
  const calculatedBins = keys.map((key, summaryI) => {
    const summary = data[key];

    const thisSummaryData = summary.xyData;

    const xySorting =
      projection === "vertical" ? verticalXYSorting : horizontalXYSorting;

    const summaryDataNest = thisSummaryData.sort(xySorting);

    const violinHist = histogram();
    let binDomain =
      projection === "vertical"
        ? [margin.top, chartSize]
        : [margin.left, chartSize + margin.left];
    const binOffset = projection === "vertical" ? binDomain[0] : 0;
    let binBuckets = [];

    for (let x = 0; x < buckets; x++) {
      binBuckets.push(binDomain[0] + x / buckets * (chartSize - binOffset));
    }
    //    binBuckets.push(binDomain[1]);

    const xyValue =
      projection === "vertical" ? p => p.xy.y : p => p.piece._orFR;

    let calculatedBins = violinHist
      .domain(binDomain)
      .thresholds(binBuckets)
      .value(xyValue)(summaryDataNest);

    calculatedBins = calculatedBins
      .map(d => ({
        y: d.x0,
        y1: d.x1 - d.x0,
        value: summaryValueAccessor(d.map(p => p.piece))
      }))
      .filter(d => d.value !== 0);

    binMax = Math.max(binMax, max(calculatedBins.map(d => d.value)));
    return { bins: calculatedBins, summary, summaryI, thisSummaryData };
  });
  calculatedBins.forEach(({ bins, summary, summaryI, thisSummaryData }) => {
    const eventListeners = eventListenersGenerator(summary, summaryI);
    const columnWidth = summary.width;
    const renderValue = renderMode && renderMode(summary, summaryI);

    const calculatedSummaryStyle = styleFn(thisSummaryData[0].piece, summaryI);
    const calculatedSummaryClass = classFn(thisSummaryData[0].piece, summaryI);

    let translate = `translate(${summary.middle},0)`;
    if (projection === "horizontal") {
      translate = `translate(${bucketSize},${summary.middle})`;
    }

    if (type.type === "heatmap" || type.type === "histogram") {
      const tiles = bins.map((d, i) => {
        return groupBarMark({
          d,
          i,
          binMax,
          columnWidth,
          bucketSize,
          projection,
          adjustedSize,
          chartSize,
          summaryI,
          data,
          summary,
          renderValue,
          summaryStyle: calculatedSummaryStyle,
          type,
          margin
        });
      });
      if (projection === "radial") {
        translate = `translate(${margin.left},${margin.top})`;
      }

      if (type.axis && type.type === "histogram") {
        let axisTranslate = `translate(${summary.x},${margin.top})`;
        let axisDomain = [0, binMax];
        if (projection === "horizontal") {
          axisTranslate = `translate(${bucketSize + margin.left},${summary.x})`;
          axisDomain = [binMax, 0];
        } else if (projection === "radial") {
          axisTranslate = `translate(${margin.left},${margin.top})`;
        }

        const axisWidth =
          projection === "horizontal" ? adjustedSize[0] : columnWidth;
        const axisHeight =
          projection === "vertical"
            ? adjustedSize[1] - margin.top
            : columnWidth;
        type.axis.size = [axisWidth, axisHeight];
        const axisScale = scaleLinear()
          .domain(axisDomain)
          .range([0, columnWidth]);
        const renderedSummaryAxis = axisCreator(type.axis, summaryI, axisScale);

        renderedSummaryMarks.push(
          <g
            className="summary-axis"
            key={`summaryPiece-axis-${summaryI}`}
            transform={axisTranslate}
          >
            {renderedSummaryAxis}
          </g>
        );
      }
      renderedSummaryMarks.push(
        <g
          {...eventListeners}
          transform={translate}
          key={`summaryPiece-${summaryI}`}
        >
          {tiles}
        </g>
      );
    } else if (type.type === "violin") {
      bins[0].y = bins[0].y - bucketSize / 2;
      bins[bins.length - 1].y = bins[bins.length - 1].y + bucketSize / 2;
      let violinArea = area().curve(type.curve || curveCatmullRom);

      if (projection === "horizontal") {
        violinArea
          .x(summaryPoint => summaryPoint.y - bucketSize / 2)
          .y0(summaryPoint => -summaryPoint.value / binMax * columnWidth / 2)
          .y1(summaryPoint => summaryPoint.value / binMax * columnWidth / 2);
      } else if (projection === "vertical") {
        violinArea
          .y(summaryPoint => summaryPoint.y + bucketSize / 2)
          .x0(summaryPoint => -summaryPoint.value / binMax * columnWidth / 2)
          .x1(summaryPoint => summaryPoint.value / binMax * columnWidth / 2);
      } else if (projection === "radial") {
        const angle = summary.pct - summary.pct_padding / 2;
        const midAngle = summary.pct_middle;

        translate = `translate(${adjustedSize[0] / 2 +
          margin.left},${adjustedSize[1] / 2 + margin.top})`;

        violinArea = inbins => {
          const forward = [];
          const backward = [];
          inbins.forEach(bin => {
            const outsidePoint = pointOnArcAtAngle(
              [0, 0],
              midAngle + angle * bin.value / binMax / 2,
              (bin.y + bin.y1 - margin.left - bucketSize / 2) / 2
            );
            const insidePoint = pointOnArcAtAngle(
              [0, 0],
              midAngle - angle * bin.value / binMax / 2,
              (bin.y + bin.y1 - margin.left - bucketSize / 2) / 2
            );

            forward.push(outsidePoint);
            backward.push(insidePoint);
          });
          return `M${forward.map(d => d.join(",")).join("L")}L${backward
            .reverse()
            .map(d => d.join(","))
            .join("L")}Z`;
        };
      }

      renderedSummaryMarks.push(
        <Mark
          transform={translate}
          key={`summaryPiece-${summaryI}`}
          {...eventListeners}
          renderMode={renderValue}
          markType="path"
          className={calculatedSummaryClass}
          style={calculatedSummaryStyle}
          d={violinArea(bins)}
        />
      );
    } else if (type.type === "joy") {
      const zeroedStart = Object.assign({}, bins[0], { value: 0 });
      const zeroedEnd = Object.assign({}, bins[bins.length - 1], { value: 0 });
      //Joy plots need to visually signify the zero baseline with their start and end position

      zeroedStart.y = zeroedStart.y - bucketSize / 2;
      zeroedEnd.y = zeroedEnd.y + bucketSize / 2;

      const joyBins = [zeroedStart, ...bins, zeroedEnd];

      let joyArea = line().curve(type.curve || curveCatmullRom);

      let joyHeight = type.amplitude || 0;

      if (projection === "horizontal") {
        joyArea
          .x(summaryPoint => summaryPoint.y)
          .y(
            summaryPoint =>
              -summaryPoint.value / binMax * (columnWidth + joyHeight) +
              columnWidth / 2
          );
      } else if (projection === "vertical") {
        joyArea
          .y(summaryPoint => summaryPoint.y)
          .x(
            summaryPoint =>
              -summaryPoint.value / binMax * (columnWidth + joyHeight) +
              columnWidth / 2
          );
      } else if (projection === "radial") {
        const angle = summary.pct - summary.pct_padding / 2;
        const midAngle = summary.pct_start + summary.pct_padding / 2;

        translate = `translate(${margin.left},${margin.top})`;

        joyArea = inbins => {
          const forward = [];
          inbins.forEach(bin => {
            const outsidePoint = pointOnArcAtAngle(
              [adjustedSize[0] / 2, adjustedSize[1] / 2],
              midAngle + angle * bin.value / binMax,
              (bin.y + bin.y1 - margin.left - bucketSize / 2) / 2
            );

            forward.push(outsidePoint);
          });
          return `M${forward.map(d => d.join(",")).join("L")}Z`;
        };
      }

      renderedSummaryMarks.push(
        <g transform={translate} key={`summaryPiece-${summaryI}`}>
          <Mark
            {...eventListeners}
            renderMode={renderValue}
            markType="path"
            className={calculatedSummaryClass}
            style={calculatedSummaryStyle}
            d={joyArea(joyBins)}
          />
        </g>
      );
    }
  });

  return renderedSummaryMarks;
}

export const drawSummaries = ({
  data,
  type,
  renderMode,
  eventListenersGenerator,
  styleFn,
  classFn,
  positionFn,
  projection,
  adjustedSize,
  margin
}) => {
  if (!type || !type.type) return;
  type = typeof type === "string" ? { type } : type;
  const chartSize =
    projection === "vertical" ? adjustedSize[1] : adjustedSize[0];
  return orFrameSummaryRenderer({
    data,
    type,
    renderMode,
    eventListenersGenerator,
    styleFn,
    classFn,
    positionFn,
    projection,
    adjustedSize,
    margin,
    chartSize
  });
};
