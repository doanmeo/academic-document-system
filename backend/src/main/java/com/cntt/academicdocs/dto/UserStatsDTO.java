package com.cntt.academicdocs.dto;

import java.util.List;

public class UserStatsDTO {
    private long totalApproved;
    private long totalPending;
    private long totalViews;
    private long totalDownloads;
    private double avgRating;
    private long totalBookmarks;
    private String topSubject;
    private String contributorRank;
    private List<String> badges;

    public UserStatsDTO() {}

    public UserStatsDTO(long totalApproved, long totalPending, long totalViews, long totalDownloads,
                        double avgRating, long totalBookmarks, String topSubject,
                        String contributorRank, List<String> badges) {
        this.totalApproved = totalApproved;
        this.totalPending = totalPending;
        this.totalViews = totalViews;
        this.totalDownloads = totalDownloads;
        this.avgRating = avgRating;
        this.totalBookmarks = totalBookmarks;
        this.topSubject = topSubject;
        this.contributorRank = contributorRank;
        this.badges = badges;
    }

    public long getTotalApproved() { return totalApproved; }
    public void setTotalApproved(long totalApproved) { this.totalApproved = totalApproved; }

    public long getTotalPending() { return totalPending; }
    public void setTotalPending(long totalPending) { this.totalPending = totalPending; }

    public long getTotalViews() { return totalViews; }
    public void setTotalViews(long totalViews) { this.totalViews = totalViews; }

    public long getTotalDownloads() { return totalDownloads; }
    public void setTotalDownloads(long totalDownloads) { this.totalDownloads = totalDownloads; }

    public double getAvgRating() { return avgRating; }
    public void setAvgRating(double avgRating) { this.avgRating = avgRating; }

    public long getTotalBookmarks() { return totalBookmarks; }
    public void setTotalBookmarks(long totalBookmarks) { this.totalBookmarks = totalBookmarks; }

    public String getTopSubject() { return topSubject; }
    public void setTopSubject(String topSubject) { this.topSubject = topSubject; }

    public String getContributorRank() { return contributorRank; }
    public void setContributorRank(String contributorRank) { this.contributorRank = contributorRank; }

    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }
}
