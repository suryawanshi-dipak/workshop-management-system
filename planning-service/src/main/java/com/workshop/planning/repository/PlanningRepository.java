package com.workshop.planning.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.workshop.planning.entity.Planning;

@Repository
public interface PlanningRepository extends JpaRepository<Planning, Long>{

    Long countByPlanningNumberStartingWith(String prefix);

    List<Planning> findByPlanningDateBetween(LocalDateTime start,
                                            LocalDateTime end);

    List<Planning> findByStatus(String status);

}
