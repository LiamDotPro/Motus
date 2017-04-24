/**
 * Created by li on 24/04/2017.
 */


function DashboardSettings(socket) {


    this.init = () => {
        this.getSourceTogglesInfo();
    };

    this.getSourceTogglesInfo = () => {
        socket.emit('getSourcesToggleData', {});
    };

    /**
     *
     * @param arr
     */
    this.addToggles = (arr) => {


        for (let x = 0; x < arr.length; x++) {
            let check = "";
            if (arr[x][2] == 1) {
                check = "checked";
            }

            $(document).ready(() => {
                $('#source-list').append(
                    '<div class="text-center col-lg-2 source-settings-square"><i class="fa fa-cog"></i><h2>' + arr[x][1] + '</h2><label><input id="' + arr[x][0] + '" class="source-toggle" ' + check + ' data-toggle="toggle" type="checkbox"></label></div>'
                )
            });

        }

        $("[data-toggle='toggle']").bootstrapToggle('destroy');
        $("[data-toggle='toggle']").bootstrapToggle();

    };

}