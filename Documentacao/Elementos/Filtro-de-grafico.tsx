//Adicionar na dashboard - filtros de dia, semana, mes e ano


import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <div className="cc-ios-tabs">
        <input className="cc-ios-tabs__input" type="radio" name="cc-ios-tabs" id="cc-tab-day" defaultChecked />
        <input className="cc-ios-tabs__input" type="radio" name="cc-ios-tabs" id="cc-tab-week" />
        <input className="cc-ios-tabs__input" type="radio" name="cc-ios-tabs" id="cc-tab-month" />
        <input className="cc-ios-tabs__input" type="radio" name="cc-ios-tabs" id="cc-tab-year" />
        <div className="cc-ios-tabs__control">
          <div className="cc-ios-tabs__thumb" />
          <label className="cc-ios-tabs__item" htmlFor="cc-tab-day">Day</label>
          <label className="cc-ios-tabs__item" htmlFor="cc-tab-week">Week</label>
          <label className="cc-ios-tabs__item" htmlFor="cc-tab-month">Month</label>
          <label className="cc-ios-tabs__item" htmlFor="cc-tab-year">Year</label>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .cc-ios-tabs {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 32px;
    background: #e8e8e8;
    font-family: Inter, Arial, sans-serif;
  }

  .cc-ios-tabs__input {
    display: none;
  }

  .cc-ios-tabs__control {
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    align-items: center;
    width: 304px;
    padding: 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    box-shadow:
      inset 0 0 0 1px rgba(15, 23, 42, 0.05),
      0 2px 8px rgba(15, 23, 42, 0.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .cc-ios-tabs__thumb {
    position: absolute;
    top: 5px;
    left: 5px;
    width: calc(25% - 4px);
    height: calc(100% - 10px);
    border-radius: 999px;
    background: #0b1220;
    box-shadow:
      0 1px 2px rgba(15, 23, 42, 0.2),
      0 8px 20px rgba(15, 23, 42, 0.16);
    transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }

  .cc-ios-tabs__item {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    border-radius: 999px;
    color: #6b7280;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    user-select: none;
    transition: color 260ms ease;
  }

  .cc-ios-tabs__item:hover {
    color: #374151;
  }

  #cc-tab-day:checked ~ .cc-ios-tabs__control .cc-ios-tabs__thumb {
    transform: translateX(0%);
  }

  #cc-tab-week:checked ~ .cc-ios-tabs__control .cc-ios-tabs__thumb {
    transform: translateX(100%);
  }

  #cc-tab-month:checked ~ .cc-ios-tabs__control .cc-ios-tabs__thumb {
    transform: translateX(200%);
  }

  #cc-tab-year:checked ~ .cc-ios-tabs__control .cc-ios-tabs__thumb {
    transform: translateX(300%);
  }

  #cc-tab-day:checked ~ .cc-ios-tabs__control label[for="cc-tab-day"],
  #cc-tab-week:checked ~ .cc-ios-tabs__control label[for="cc-tab-week"],
  #cc-tab-month:checked ~ .cc-ios-tabs__control label[for="cc-tab-month"],
  #cc-tab-year:checked ~ .cc-ios-tabs__control label[for="cc-tab-year"] {
    color: #ffffff;
  }

  @media (prefers-reduced-motion: reduce) {
    .cc-ios-tabs__thumb,
    .cc-ios-tabs__item {
      transition: none;
    }
  }`;

export default Button;
