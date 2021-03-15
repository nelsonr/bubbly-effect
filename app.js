const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let debug = false;

const center = {
    x: canvas.width / 2,
    y: canvas.height / 2
}

const ball = {
    x: center.x,
    y: canvas.height - 75,
    speed: 0.33333,
    radius: 75
};

let baseLineY = canvas.height - 200;
let topLineY = ball.y - ball.radius;

const basePointLeft = {
    x: center.x - ball.radius - 200,
    y: baseLineY
};

const basePointRight = {
    x: center.x + ball.radius + 200,
    y: baseLineY
};

let intersectionPoints = {
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
    const m = (y2 - y1) / (x2 - x1);

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
        intersects: (x1_intersection && y1_intersection && x2_intersection && y2_intersection),
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

function setup() {
    center.y = canvas.height;
}

function update() {
    ball.y -= ball.speed;
    const drag = ball.speed * 0.5;

    if ((ball.y + ball.radius) < -ball.radius) {
        ball.y = canvas.height - ball.radius;
        topLineY = ball.y - ball.radius;
    }

    if (topLineY <= baseLineY) {
        topLineY -= drag;
    } else {
        topLineY -= ball.speed;
    }

    const lineIntersection = circleLineIntersection(0, topLineY, canvas.width, topLineY, ball.x, ball.y, ball.radius);

    if (lineIntersection.intersects) {
        intersectionPoints = lineIntersection;
    } else {
        intersectionPoints.left.y += drag * 1.75;
        intersectionPoints.right.y += drag * 1.75;
    }
}

function draw() {
    requestAnimationFrame(draw);

    update();

    ctx.fillStyle = 'hotpink';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circle(ball.x, ball.y, ball.radius, true);
    ctx.fillRect(0, basePointLeft.y - 1, canvas.width, canvas.height - basePointLeft.y + 1);

    // Draw curve between points
    drawCurve(intersectionPoints);

    if (debug) {
        ctx.fillStyle = 'black';
        circle(intersectionPoints.right.x, intersectionPoints.right.y, 4, true);
        circle(intersectionPoints.left.x, intersectionPoints.left.y, 4, true);
        line(0, topLineY, canvas.width, topLineY);
        ctx.fillStyle = 'hotpink'
    }
}

function drawCurve(lineIntersect) {
    ctx.beginPath();

    // 1. Start on the intersection point on the left
    ctx.moveTo(lineIntersect.left.x, lineIntersect.left.y);

    // 2. Draw a curve to the base point on the left
    ctx.quadraticCurveTo(lineIntersect.left.x, basePointLeft.y, basePointLeft.x, basePointLeft.y);

    // 3. Draw a line to the base point on the right
    ctx.lineTo(basePointRight.x, basePointRight.y);

    // 4. Draw a curve up to the intersection point on the right
    ctx.quadraticCurveTo(lineIntersect.right.x, basePointRight.y, lineIntersect.right.x, lineIntersect.right.y);

    // 5. Connect back to the intersection point on the left
    ctx.lineTo(lineIntersect.left.x, lineIntersect.left.y);

    // 6. Close and fill the final shape
    ctx.fill();
    ctx.closePath();
}

setup();
draw();