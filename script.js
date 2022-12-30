
// Standard Normal variate using Box-Muller transform.
// From https://stackoverflow.com/a/36481059
function gaussianRandom(mean=0, stdev=1) {
  let u = 1 - Math.random(); //Converting [0,1) to (0,1)
  let v = Math.random();
  let z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  // Transform to the desired mean and standard deviation:
  return z * stdev + mean;
}

// Random integer between two numbers, inclusive
// Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
function integerRandom(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeCurve(steps, dimensions, decay) {
  // Calculate coefficients for curve
  const magnitude_coefficients = []
  const angle_coefficients = []
  for (let i=-steps; i<steps; i++) {
    magnitude_coefficients.push(gaussianRandom() / (Math.abs(steps*dimensions + 1) + 0.5)**decay)
    angle_coefficients.push(i*dimensions + 1)
  }
  return {magnitude_coefficients, angle_coefficients}
}

function main() {
  // Initialise canvas
  const canvas = document.querySelector(".myCanvas");
  const width = canvas.width = window.innerWidth;
  const height = canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  
  // Move canvas origin to the centre
  ctx.translate(width / 2, height / 2);

  // Set parameters of curve
  const dimensions = integerRandom(3, 10)
  const steps = 2
  const decay = 1.5
  
  console.info({dimensions, steps})
  
  // Set reslution of drawing
  const theta_resolution = 2000  // number of straight line segments approximating the curve
  const interpolation_resolution = 100  // number of time steps animating between each curve end point
  const interpolation_timestep = 100  // milliseconds between each animation frame
  
  // Create initial curve control points
  let point_1 = null
  let point_2 = makeCurve(steps, dimensions, decay)
  let point_3 = makeCurve(steps, dimensions, decay)
  let point_4 = makeCurve(steps, dimensions, decay)
  
  // Start animation loop
  let animation_frame = interpolation_resolution
  const animation_handle = setInterval(function() {
    
    // If we've reached a control point, then generate a new one
    if (animation_frame >= interpolation_resolution) {
      point_1 = point_2
      point_2 = point_3
      point_3 = point_4
      point_4 = makeCurve(steps, dimensions, decay)
      animation_frame = -1
    }
    
    // Move to the next frame in the interpolation
    animation_frame += 1
    const t = animation_frame / interpolation_resolution
    const t_2 = t * t
    const t_3 = t_2 * t
	  
    // Calculate points on interpolated curve
    const z_real_points = []
    const z_imaginary_points = []
    for (let theta_i=0; theta_i<theta_resolution; theta_i++) {
      const theta = Math.PI * 2 * theta_i / theta_resolution
      
      let z_real = 0
      let z_imaginary = 0
      for (const k in point_1.magnitude_coefficients) {
        // Use the points as control points of a cubic b-spline
        const m_p1 = point_1.magnitude_coefficients[k]
        const m_p2 = point_2.magnitude_coefficients[k]
        const m_p3 = point_3.magnitude_coefficients[k]
        const m_p4 = point_4.magnitude_coefficients[k]
        const magnitude_coefficient = ((m_p1 + 4*m_p2 + m_p3) + t*(-3*m_p1 + 3*m_p3) + 
                                       t_2*(3*m_p1 - 6*m_p2 + 3*m_p3) + t_3*(-1*m_p1 + 3*m_p2 - 3*m_p3 + m_p4)) / 6
        const a_p1 = point_1.angle_coefficients[k]
        const a_p2 = point_2.angle_coefficients[k]
        const a_p3 = point_3.angle_coefficients[k]
        const a_p4 = point_4.angle_coefficients[k]
        const angle_coefficient = ((a_p1 + 4*a_p2 + a_p3) + t*(-3*a_p1 + 3*a_p3) + 
                                       t_2*(3*a_p1 - 6*a_p2 + 3*a_p3) + t_3*(-1*a_p1 + 3*a_p2 - 3*a_p3 + a_p4)) / 6
        z_real += (magnitude_coefficient * Math.cos(angle_coefficient * theta))
        z_imaginary += (magnitude_coefficient * Math.sin(angle_coefficient * theta))
      }
      z_real_points.push(z_real)
      z_imaginary_points.push(z_imaginary)
    }
    
    // Scale curve to canvas size
    const padding = 20
    const z_min = Math.min(...z_real_points, ...z_imaginary_points)
    const z_max = Math.max(...z_real_points, ...z_imaginary_points)
    const scale_factor = (Math.min(width, height) - padding) / (z_max - z_min)
    
    const z_real_draw_points = []
    const z_imaginary_draw_points = []
    for (const i in z_real_points) {
      z_real_draw_points.push(z_real_points[i] * scale_factor)
      z_imaginary_draw_points.push(z_imaginary_points[i] * scale_factor)
    }
    
    // Paint background
    ctx.fillStyle = "rgb(230, 230, 230)";
    ctx.fillRect(-width/2, -height/2, width, height);
    
    // Paint curve
    ctx.fillStyle = "rgb(50, 50, 50)"
    ctx.strokeStyle = "rgb(50, 50, 50)"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(z_real_draw_points[z_real_draw_points.length-1], z_imaginary_draw_points[z_real_draw_points.length-1])
    for (const i in z_real_draw_points) {
      ctx.lineTo(z_real_draw_points[i], z_imaginary_draw_points[i])
    }
    ctx.stroke()
  },
  interpolation_timestep)

}

main()
