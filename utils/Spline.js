

class Spline {

    kValues;

    constructor(x_values, y_values) {
        this.x_values = x_values;
        this.y_values = y_values;
        this.kValues = [];

        this.createTheSystem();
    }


    FindYof(x_target) {
        if (x_target == this.x_values[0]) {
            return this.y_values[0];
        }

        let i = this.findIndexOf(x_target);
        const xDeltaBefore = this.x_values[i] - this.x_values[i - 1];
        const yDeltaBefore = this.y_values[i] - this.y_values[i - 1];

        const t = (x_target - this.x_values[i - 1]) / xDeltaBefore;
        const a = this.kValues[i - 1] * xDeltaBefore - yDeltaBefore;
        const b = (-this.kValues[i] * xDeltaBefore) + yDeltaBefore;
        const q =
            (1 - t) * this.y_values[i - 1] +
            t * this.y_values[i] +
            t * (1 - t) * (a * (1 - t) + b * t);
        return q;
    }

    /**
     * Tweeked Binary search is used to determine the index of the target_x ,
     */
    findIndexOf(x_target) {
        let smallestPointer = 0;
        let highestPointer = this.x_values.length;

        while (smallestPointer <= highestPointer) {
            let middle = Math.floor((smallestPointer + highestPointer) / 2);

            if (this.x_values[middle] < x_target)
                smallestPointer = middle + 1;
            else {
                highestPointer = middle - 1;
            }
        }

        return smallestPointer;
    }

    // https://en.m.wikipedia.org/wiki/Spline_interpolation
    createTheSystem() {
        const n = this.x_values.length - 1;
        const eqMatrix = [];
        // Creating an array with zero values
        for (let i = 0; i < n + 1; i++) {
            eqMatrix.push(new Float64Array(n + 2))
        };

        // First row:
        const firstDeltaX = this.x_values[1] - this.x_values[0];
        const firstDeltaY = this.y_values[1] - this.y_values[0];
        eqMatrix[0][0] = 2 / firstDeltaX;
        eqMatrix[0][1] = 1 / firstDeltaX;
        eqMatrix[0][n + 1] = (3 * firstDeltaY) / (firstDeltaX * firstDeltaX); // b1

        // Last row:
        const lastDeltaX = this.x_values[n] - this.x_values[n - 1];
        const lastDeltaY = this.y_values[n] - this.y_values[n - 1];
        eqMatrix[n][n - 1] = 1 / lastDeltaX;
        eqMatrix[n][n] = 2 / lastDeltaX;
        eqMatrix[n][n + 1] = (3 * lastDeltaY) / ((this.x_values[n] - (this.x_values[n - 1]) * lastDeltaX)); // b2

        // Rows in between: 
        for (let i = 1; i < n; i++) {
            const xDeltaBefore = this.x_values[i] - this.x_values[i - 1];
            const yDeltaBefore = this.y_values[i] - this.y_values[i - 1];

            const xDeltaNext = this.x_values[i + 1] - this.x_values[i];
            const yDeltaNext = this.y_values[i + 1] - this.y_values[i];

            eqMatrix[i][i - 1] = 1 / xDeltaBefore;
            eqMatrix[i][i] = 2 * ((1 / xDeltaBefore) + (1 / xDeltaNext));
            eqMatrix[i][i + 1] = 1 / xDeltaNext;
            eqMatrix[i][n + 1] = 3 * (yDeltaBefore / (xDeltaBefore * xDeltaBefore) + yDeltaNext / (xDeltaNext * xDeltaNext)); // bi
        }

        this.solveEquations(eqMatrix);
    }


    // Gaussian elimination
    solveEquations(eqMatrix) {
        const n = eqMatrix.length;
        let row = 0;
        let column = 0;
        while (row < n && column <= n) {
            // finding the highest value: 
            let maxRow = 0;
            let maxValue = -Infinity;
            for (let i = row; i < n; i++) {
                const currentValue = Math.abs(eqMatrix[i][column]);
                if (currentValue > maxValue) {
                    maxRow = i;
                    maxValue = currentValue;
                }
            }

            if (eqMatrix[maxRow][column] === 0) {
                column++;
            } else {
                // Swapping the row with the highest value in the pivot column with current row.
                let p = eqMatrix[row];
                eqMatrix[row] = eqMatrix[maxRow];
                eqMatrix[maxRow] = p;

                // For the row beneath the current pivot row and within the pivot column, 
                // find a fraction that corresponds to the ratio of the value in that column to the pivot, 
                // itself. After this, subtract the current pivot row multiplied by the fraction from each corresponding row element. 
                for (let i = row + 1; i < n; i++) {
                    const f = eqMatrix[i][column] / eqMatrix[row][column];
                    eqMatrix[i][column] = 0;
                    for (let j = column + 1; j <= n; j++) {
                        eqMatrix[i][j] -= eqMatrix[row][j] * f
                    };
                }

                row++;
                column++;
            }
        }

        // Gauss-Jordan Elimination
        for (let i = n - 1; i >= 0; i--) {
            var currentValue = 0;
            if (eqMatrix[i][i]) {
                currentValue = eqMatrix[i][n] / eqMatrix[i][i];
            }

            this.kValues[i] = currentValue;

            for (let j = i - 1; j >= 0; j--) {
                eqMatrix[j][n] -= eqMatrix[j][i] * currentValue;
                eqMatrix[j][i] = 0;
            }
        }
    }

}

module.exports = Spline;