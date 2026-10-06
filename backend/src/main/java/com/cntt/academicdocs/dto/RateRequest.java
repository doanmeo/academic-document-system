package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RateRequest {

    @NotNull(message = "Điểm đánh giá không được để trống")
    @Min(value = 1, message = "Điểm tối thiểu là 1 sao")
    @Max(value = 5, message = "Điểm tối đa là 5 sao")
    private Integer score;

    public RateRequest() {}

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
}
