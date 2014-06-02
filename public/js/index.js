(function() {
    'use strict';
    document.addEventListener('DOMContentLoaded', function() {

        //OpenFin is ready.
        fin.desktop.main(function() {
            //request the windows.
            var mainWindow = fin.desktop.Window.getCurrent(),
                draggableArea = document.querySelector('.container'),
                //start the cpu window in a hidded state
                cpuWindow = windowFactory.create({
                    "name": "cpuChild",
                    "url": 'views/cpu.html',
                }),
                addApplicationWindow;

            fin.desktop.System.getConfig(function(config) {
                addApplicationWindow = WindowFactory.create({
                    name: 'addApplicationWindow',
                    url: 'views/addapplication.html',
                    defaultHeight: config.startup_app.defaultHeight,
                    defaultWidth: config.startup_app.defaultWidth,
                    maxWidth: config.startup_app.maxWidth,
                    maxHeight: config.startup_app.maxHeight,
                });

                //register the event handlers.
                setEventHandlers(mainWindow, cpuWindow, addApplicationWindow);
            });

            //set the drag animations.
            mainWindow.defineDraggableArea(draggableArea, function(data) {
                mainWindow.animate({
                    opacity: utils.transparentOpacityAnimation,
                }, {
                    interrupt: false
                });
            }, function(data) {
                mainWindow.animate({
                    opacity: utils.solidOpacityAnimation
                }, {
                    interrupt: false
                });
            }, function(err) {
                console.log(err);
            });

            //show the main window now that we are ready.
            mainWindow.show();
        });

        //set event handlers for the different buttons.
        var setEventHandlers = function(mainWindow, cpuWindow, addApplicationWindow) {
            //Buttons and components.
            var desktopNotificationButton = document.getElementById('desktop-notification'),
                cpuInfoButton = document.getElementById('cpu-info'),
                closeButton = document.getElementById('close-app'),
                arrangeWindowsButton = document.getElementById('arrange-windows'),
                minimizeButton = document.getElementById('minimize-window'),
                addApplicationButton = document.getElementById('add-app');

            //Close button event handler
            closeButton.addEventListener('click', function() {
                mainWindow.close();
            });

            //Minimize button event handler
            minimizeButton.addEventListener('click', function() {
                mainWindow.minimize();
            });

            //Desktop notification event handler
            desktopNotificationButton.addEventListener('click', function() {
                var notification = new fin.desktop.Notification({
                    url: '/views/notification.html',
                    message: 'Notification from app'
                });
            });

            //Cpu information button.
            cpuInfoButton.addEventListener('click', function() {
                cpuWindow.isShowing(function(showing) {
                    if (!showing) {
                        mainWindow.getBounds(function(bounds) {
                            cpuWindow.moveTo(bounds.left + bounds.width + utils.cpuWindowMargin, bounds.top, function() {
                                cpuWindow.show();
                            });
                        });
                    }
                });
            });

            //Add application button.
            addApplicationButton.addEventListener('click', function() {
                addApplicationWindow.isShowing(function(showing) {
                    if (!showing) {
                        addApplicationWindow.show();
                    }
                });
            });

            //Arrange windows in the desktop.
            arrangeWindowsButton.addEventListener('click', function() {
                //move them to the top left by default, if windows are there move to bottom right.
                fin.desktop.System.getMonitorInfo(function(monitorInfo) {
                    mainWindow.getBounds(function(mainWindowBounds) {
                        cpuWindow.getBounds(function(cpuWindowBounds) {
                            animateWindows({
                                monitorInfo: monitorInfo,
                                mainWindowBounds: mainWindowBounds,
                                cpuWindowBounds: cpuWindowBounds,
                                mainWindow: mainWindow,
                                cpuWindow: cpuWindow
                            });
                        });
                    });
                });
            });
        };

        //animates both windows.
        var animateWindows = function(options) {
            //expects an options object with the following shape:
            // {
            //     monitorInfo,
            //     mainWindowBounds,
            //     cpuWindowBounds,
            //     mainWindow,
            //     cpuWindow
            // }
            var mainWindowDestination = {
                top: 0,
                left: 0,
                duration: 1000
            };

            var cpuWindowDestination = {
                top: 0,
                left: 0,
                duration: 1000
            };

            //check the position and adjust the mainWindowDestination.
            if (options.mainWindowBounds.top === destination.top && options.mainWindowBounds.left === mainWindowDestination.left) {
                mainWindowDestination.top = options.monitorInfo.primaryMonitor.availableRect.bottom - options.mainWindowBounds.height;
                mainWindowDestination.left = options.monitorInfo.primaryMonitor.availableRect.right - options.mainWindowBounds.width;
            }

            //animate the main window.
            options.mainWindow.animate({
                    opacity: utils.transparentOpacityAnimation,
                    position: mainWindowDestination
                }, {
                    interrupt: true
                },
                function(evt) {
                    options.mainWindow.animate({
                        opacity: utils.solidOpacityAnimation
                    });
                });

            //update destination for the cpuWindow.
            if (cpuWindowDestination.left < options.mainWindowBounds.width) {
                cpuWindowDestination.left += (options.mainWindowBounds.width + utils.cpuWindowMargin);
            } else {
                cpuWindowDestination.left -= (options.cpuWindowBounds.width + utils.cpuWindowMargin);
            }
            //animate the cpu child window.
            options.cpuWindow.animate({
                opacity: utils.transparentOpacityAnimation,
                position: cpuWindowDestination
            }, {
                interrupt: true
            }, function(evt) {
                options.cpuWindow.animate({
                    opacity: utils.solidOpacityAnimation
                });
            });
        };
    });
}());
