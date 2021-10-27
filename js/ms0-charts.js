let time = [];
let temperature = [];
let pressure = [];
let acc_x = [];
let acc_y = [];
let acc_z = [];
let gyr_x = [];
let gyr_y = [];
let gyr_z = [];

for (let i=0; i<ms0_data.length ; i++)
{
    time.push(ms0_data[i][0]);
    temperature.push(ms0_data[i][8]);
    pressure.push(ms0_data[i][1]);
    acc_x.push(ms0_data[i][2]);
    acc_y.push(ms0_data[i][3]);
    acc_z.push(ms0_data[i][4]);
    gyr_x.push(ms0_data[i][5]);
    gyr_y.push(ms0_data[i][6]);
    gyr_z.push(ms0_data[i][7]);
}

config_temp_press = {
    type: "line",
    data: {
        labels: time,
        datasets: [
            {
                label: "Temperature °C",
                fill: false,
                backgroundColor: "red",
                borderColor: "red",
                data: temperature,
                yAxisID: 'yAxes1'
            },
            {
                label: "Pressure hPa",
                fill: false,
                backgroundColor: "blue",
                borderColor: "blue",
                data: pressure,
                yAxisID: 'yAxes2'
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
                    labelString: "°C"
                },
                title: {
                    display: true,
                    text: 'Temperature (°C)'
                },
                position: 'left'
            },
            yAxes2: {
                scaleLabel: {
                    display: true,
                    labelString: "hPa"
                },
                title: {
                    display: true,
                    text: 'Pressure (hPa)'
                },
                position: 'right'
            }
        },
        plugins: {
            title: {
              display: true,
              text: 'Temperature and Pressure graph ',
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
    
};

config_acc = {
    type: "line",
    data: {
        labels: time,
        datasets: [
            {
                label: "ACC X (g)",
                fill: false,
                backgroundColor: "red",
                borderColor: "red",
                data: acc_x
            },
            {
                label: "ACC Y (g)",
                fill: false,
                backgroundColor: "blue",
                borderColor: "blue",
                data: acc_y
            },
            {
                label: "ACC Z (g)",
                fill: false,
                backgroundColor: "green",
                borderColor: "green",
                data: acc_z
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
                    labelString: "g"
                },
                title: {
                    display: true,
                    text: 'Accelerometers (g)'
                },
                position: 'left'
            }
        },
        plugins: {
            title: {
              display: true,
              text: 'Accelerometers graph ',
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
    
};

config_gyr = {
    type: "line",
    data: {
        labels: time,
        datasets: [
            {
                label: "GYR X (rad/s)",
                fill: false,
                backgroundColor: "red",
                borderColor: "red",
                data: gyr_x
            },
            {
                label: "GYR Y (rad/s)",
                fill: false,
                backgroundColor: "blue",
                borderColor: "blue",
                data: gyr_y
            },
            {
                label: "GYR Z (rad/s)",
                fill: false,
                backgroundColor: "green",
                borderColor: "green",
                data: gyr_z
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
                    labelString: "rad/s"
                },
                title: {
                    display: true,
                    text: 'Gyrometers (rad/s)'
                },
                position: 'left'
            }
        },
        plugins: {
            title: {
              display: true,
              text: 'Gyrometers graph ',
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
    
};


context_temp_press = document.getElementById("temp_press").getContext("2d");
chart = new Chart(context_temp_press, config_temp_press);

context_acc = document.getElementById("acc").getContext("2d");
chart = new Chart(context_acc, config_acc);

context_gyr = document.getElementById("gyr").getContext("2d");
chart = new Chart(context_gyr, config_gyr);
