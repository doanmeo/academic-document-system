package com.cntt.academicdocs.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class ToggleActiveRequest {

    @NotNull(message = "Trạng thái kích hoạt không được để trống")
    @JsonProperty("isActive")
    @JsonAlias({"active", "isActive"})
    private Boolean isActive;

    public ToggleActiveRequest() {}

    public ToggleActiveRequest(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        this.isActive = active;
    }
}
