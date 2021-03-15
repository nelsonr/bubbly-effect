const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const center = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

const circlePos = {
    x: center.x,
    y: canvas.height,
};

const radius = 75;
let baseLineY = canvas.height - 200;
let topLineY = circlePos.y - radius;
let minTopLineY = baseLineY - 10;

const basePointLeft = {
    x: center.x - radius - 150,
    y: baseLineY
};

const basePointRight = {
    x: center.x + radius + 150,
    y: baseLineY
};

let intersectionPoints =  {
    left: {
        x: basePointLeft.x,
        y: baseLineY,
    },
    right: {
        x: basePointRight.x,
        y: baseLineY,
    }
};

const fillColor = 'hotpink';
ctx.fillStyle = fillColor;

function circle(x, y, r, fill) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);

    if (fill) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
    
    ctx.closePath();
}

function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function circleLineIntersection(x1, y1, x2, y2, cx, cy, r) {
    const m = (y2 - y1) / (x2-x1);

    const c = (-m * x1 + y1);
    const aprim = (1 + Math.pow(m, 2));
    const bprim = 2 * m * (c - cy) - 2 * cx;
    const cprim = Math.pow(cx, 2) + Math.pow((c - cy), 2) - Math.pow(r, 2);

    const delta = Math.pow(bprim, 2) - 4 * aprim * cprim;

    const x1_intersection = (-bprim + Math.sqrt(delta)) / (2 * aprim);
    const y1_intersection = m * x1_intersection + c;

    const x2_intersection = (-bprim - Math.sqrt(delta)) / (2 * aprim);
    const y2_intersection = m * x2_intersection + c;

    return {
        left: {
            x: x2_intersection,
            y: y2_intersection,
        },
        right: {
            x: x1_intersection,
            y: y1_intersection,
        }
    };
}

function setup () {
    center.y = canvas.height;
}

function update() {
    circlePos.y -= 0.5;

    if ((circlePos.y + radius) < 0) {
        circlePos.y = canvas.height;
    }

    topLineY = lerp(topLineY, circlePos.y - radius, 0.8);

    if (topLineY <= minTopLineY) {
        topLineY = minTopLineY;
    }

    const lineIntersection = circleLineIntersection(0, topLineY, canvas.width, topLineY, circlePos.x, circlePos.y, radius);

    if (lineIntersection.left.x) {
        intersectionPoints = lineIntersection;
    } else {
        intersectionPoints.left.y += 1.5;
        intersectionPoints.right.y += 1.5;
    }
}

function draw () {
    requestAnimationFrame(draw);

    update();

    ctx.fillStyle = 'hotpink';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, basePointLeft.y, canvas.width, canvas.height - basePointLeft.y);

    circle(circlePos.x, circlePos.y, radius, true);

    ctx.fillStyle = 'black';
    line(0, topLineY, canvas.width, topLineY);
    circle(intersectionPoints.right.x, intersectionPoints.right.y, 4, true);
    circle(intersectionPoints.left.x, intersectionPoints.left.y, 4, true);

    // Draw curve between points
    ctx.fillStyle = 'green'
    drawCurve(intersectionPoints);
}

function drawCurve(lineIntersect) {
    const controlPointDeviance = 50;
    
    ctx.beginPath();
    
    // 1. Start on the intersection point on the left
    ctx.moveTo(lineIntersect.left.x, lineIntersect.left.y);

    // 2. Draw a curve to the base point on the left
    ctx.quadraticCurveTo(lineIntersect.left.x - controlPointDeviance, basePointLeft.y, basePointLeft.x, basePointLeft.y);

    // 3. Draw a line to the base point on the right
    ctx.lineTo(basePointRight.x, basePointRight.y);

    // 4. Draw a curve up to the intersection point on the right
    ctx.quadraticCurveTo(lineIntersect.right.x + controlPointDeviance, basePointRight.y, lineIntersect.right.x, lineIntersect.right.y);

    // 5. Connect back to the intersection point on the left
    ctx.moveTo(lineIntersect.right.x, lineIntersect.right.y);
    ctx.quadraticCurveTo(
        circlePos.x,
        lineIntersect.left.y,
        lineIntersect.left.x, 
        lineIntersect.left.y
    );

    // 6. Close and fill the final shape
    ctx.fill();
    ctx.closePath();
}

function lerp(start, end, t) {
  return (1 - t) * start + end * t;
}

setup();
draw();