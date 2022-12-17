let time = [];
let altitude = [];
let vitesse = [];
let distance = [];

for (let i=0; i<ms1_data.length ; i++)
{
    time.push(ms1_data[i][0]);
    altitude.push(ms1_data[i][1]);
    vitesse.push(ms1_data[i][2]);
    distance.push(ms1_data[i][3]);
}

config_altitude = {
    type: "line",
    data: {
        labels: time,
        datasets: [
            {
                label: "Altitude (m)",
                fill: false,
                backgroundColor: "red",
                borderColor: "red",
                data: altitude,
                yAxisID: 'yAxes1'
            }
        ]
    },
    options: {
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                },
                scaleLabel: {
                    display: true,
                    labelString: "Time (s)"
                },
                title: {
                    display: true,
                    text: 'Time (s)'
                }
            },
            yAxes1: {
                scaleLabel: {
                    display: true,
                    labelString: "m"
                },
                title: {
                    display: true,
                    text: 'Altitude (m)'
                },
                position: 'left'
            }
        },
        plugins: {
            title: {
              display: true,
              text: 'Altitude graph ',
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
    
};

config_speed = {
    type: "line",
    data: {
        labels: time,
        datasets: [
            {
                label: "Speed (km/h)",
                fill: false,
                backgroundColor: "red",
                borderColor: "red",
                data: vitesse,
                yAxisID: 'yAxes1'
            }
        ]
    },
    options: {
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                },
                scaleLabel: {
                    display: true,
                    labelString: "Time (s)"
                },
                title: {
                    display: true,
                    text: 'Time (s)'
                }
            },
            yAxes1: {
                scaleLabel: {
                    display: true,
                    labelString: "km/h"
                },
                title: {
                    display: true,
                    text: 'Speed (km/h)'
                },
                position: 'left'
            }
        },
        plugins: {
            title: {
              display: true,
              text: 'Speed graph ',
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
    
};

config_distance = {
    type: "line",
    data: {
        labels: time,
        datasets: [
            {
                label: "Distance (m)",
                fill: false,
                backgroundColor: "red",
                borderColor: "red",
                data: distance,
                yAxisID: 'yAxes1'
            }
        ]
    },
    options: {
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                },
                scaleLabel: {
                    display: true,
                    labelString: "Time (s)"
                },
                title: {
                    display: true,
                    text: 'Time (s)'
                }
            },
            yAxes1: {
                scaleLabel: {
                    display: true,
                    labelString: "m"
                },
                title: {
                    display: true,
                    text: 'Distance (m)'
                },
                position: 'left'
            }
        },
        plugins: {
            title: {
              display: true,
              text: 'Distance graph ',
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
    
};

context_altitude = document.getElementById("altitude").getContext("2d");
chart = new Chart(context_altitude, config_altitude);

context_speed = document.getElementById("speed").getContext("2d");
chart = new Chart(context_speed, config_speed);

context_distance = document.getElementById("distance").getContext("2d");
chart = new Chart(context_distance, config_distance);
