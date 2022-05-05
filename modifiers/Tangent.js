import { ChartModifierBase2D } from "scichart/Charting/ChartModifiers/ChartModifierBase2D";
import { EChart2DModifierType } from "scichart/types/ChartModifierType";
import { testIsInBounds } from "scichart/utils/pointUtil";
import { DpiHelper } from 'scichart/Charting/Visuals/TextureManager/DpiHelper';
import { CustomAnnotation } from 'scichart/Charting/Visuals/Annotations/CustomAnnotation';
import { EHorizontalAnchorPoint, EVerticalAnchorPoint } from 'scichart/types/AnchorPoint';
import { LineAnnotation } from "scichart/Charting/Visuals/Annotations/LineAnnotation";
import { ECoordinateMode } from "scichart/Charting/Visuals/Annotations/AnnotationBase";

export default class Tangent extends ChartModifierBase2D {

    spline

    constructor(spline) {
        super();
        this.spline = spline
    }


    type = EChart2DModifierType.Custom;

    modifierMouseMove(args) {
        super.modifierMouseMove(args);
        if (!this.isAttached) {
            throw new Error("Should not call HitApiModifier.modifierMouseDown if not attached");
        }

        const mousePoint = args.mousePoint;
        const { left, right, top, bottom } = this.parentSurface?.seriesViewRect;

        if (testIsInBounds(mousePoint.x, mousePoint.y, left, bottom, right, top)) {
            const indexOfLineSeries = this.parentSurface?.renderableSeries.items.findIndex(item => item.type === 'LineSeries');
            const lineSeriesPointer = this.parentSurface?.renderableSeries.items[indexOfLineSeries];

            const svgAnnotation = new CustomAnnotation({
                svgString: `<svg width="8" height="8"><circle cx="50%" cy="50%" r="4" fill="#90EE90"/></svg>`,
                isHidden: true,
                horizontalAnchorPoint: EHorizontalAnchorPoint.Center,
                verticalAnchorPoint: EVerticalAnchorPoint.Center
            });
            this.parentSurface.annotations.add(svgAnnotation);

            const tangentAnnotation = new LineAnnotation({
                stroke: "#ffc800",
                strokeThickness: 3,
                isHidden: true,
                xCoordinateMode: ECoordinateMode.DataValue,
                yCoordinateMode: ECoordinateMode.DataValue,
            });
            this.parentSurface.annotations.add(tangentAnnotation);

            this.parentSurface.domCanvas2D.addEventListener('mousemove', (mouseEvent) => {
                const premultipliedX = mouseEvent.offsetX * DpiHelper.PIXEL_RATIO;
                const premultipliedY = mouseEvent.offsetY * DpiHelper.PIXEL_RATIO;
                const hitTestInfo = lineSeriesPointer.hitTestProvider.hitTest(premultipliedX, premultipliedY, 10);
                if (hitTestInfo.isHit) {
                    svgAnnotation.x1 = hitTestInfo.hitTestPointValues.x;
                    svgAnnotation.y1 = hitTestInfo.hitTestPointValues.y;
                    svgAnnotation.isHidden = false;



                    // Tangent calculations: 
                    const currX = hitTestInfo.hitTestPointValues.x;
                    const currY = hitTestInfo.hitTestPointValues.y;
                    const eps = 0.05;
                    const nearX = currX + eps;
                    const nearY = this.spline.FindYof(nearX);
                    const slope = ((nearY - currY) / eps);

                    // First point on the tangent line
                    const FirstXpointOnLine = currX - 1;
                    const FirstYpointOnLine = (slope * FirstXpointOnLine) - (slope * currX) + currY;

                    // Last point on the tangent line
                    const LastXpointOnLine = currX + 1;
                    const LastYpointOnLine = (slope * LastXpointOnLine) - (slope * currX) + currY;

                    // Setting the points on the annotation
                    tangentAnnotation.x1 = FirstXpointOnLine;
                    tangentAnnotation.x2 = LastXpointOnLine;
                    tangentAnnotation.y1 = FirstYpointOnLine;
                    tangentAnnotation.y2 = LastYpointOnLine
                    tangentAnnotation.isHidden = false;
                }

            });
        }
    }
}