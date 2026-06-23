def calculate_signal_score(candidate):


    signals = candidate.get(
        "redrob_signals",
        {}
    )


    score = 0


    for key,value in signals.items():

        if isinstance(value,(int,float)):

            score += value


    return min(score,100)